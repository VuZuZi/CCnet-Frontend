import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';
import { normalizeUnreadCounts } from '@/features/chat/utils/cache.conversations';
import { getEntityId } from '@/features/chat/utils/id';

function getUnreadCountForUser(conversation, myId) {
  if (!conversation || !myId) return 0;

  const unreadCounts = normalizeUnreadCounts(conversation?.unreadCounts);
  return Number(unreadCounts[String(myId)] || 0);
}

function buildSeenUser(user, myId) {
  return {
    _id: myId,
    id: myId,
    userId: myId,
    fullName: user?.fullName || user?.username || user?.email || 'You',
    email: user?.email || '',
    avatar: user?.avatar || '',
  };
}

function patchConversationUnread(oldData, cid, myId) {
  const arr = Array.isArray(oldData) ? oldData : [];

  return arr.map((item) => {
    if (String(item?._id) !== cid) return item;

    const unreadCounts = normalizeUnreadCounts(item?.unreadCounts);
    unreadCounts[String(myId)] = 0;

    return {
      ...item,
      unreadCounts,
    };
  });
}

function patchMessagesSeen(oldData, myId, me, seenAt) {
  const arr = Array.isArray(oldData) ? oldData : [];

  return arr.map((message) => {
    const senderId = getEntityId(message?.senderId);

    if (!senderId || senderId === String(myId) || message?.isUnsent) {
      return message;
    }

    const seenBy = Array.isArray(message?.seenBy) ? [...message.seenBy] : [];
    const alreadySeen = seenBy.some(
      (item) => getEntityId(item?.userId || item) === String(myId)
    );

    if (alreadySeen) {
      return {
        ...message,
        status: 'seen',
      };
    }

    return {
      ...message,
      status: 'seen',
      seenBy: [
        ...seenBy,
        {
          userId: me,
          seenAt,
        },
      ],
    };
  });
}

export function useMarkAsRead() {
  const [isMarking, setIsMarking] = useState(false);
  const queryClient = useQueryClient();

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const inflightRef = useRef(new Set());
  const cooldownRef = useRef(new Map());

  const markAsRead = useCallback(
    async (conversationId, options = {}) => {
      const cid = String(conversationId || '');
      if (!cid || !myId) return false;

      const { force = false, cooldownMs = 3000 } = options;

      const now = Date.now();
      const lastCalledAt = cooldownRef.current.get(cid) || 0;

      if (!force && now - lastCalledAt < cooldownMs) {
        return false;
      }

      if (inflightRef.current.has(cid)) {
        return false;
      }

      const conversations = queryClient.getQueryData(chatKeys.conversations());
      const conversation = Array.isArray(conversations)
        ? conversations.find((item) => String(item?._id) === cid)
        : null;

      const unreadCount = getUnreadCountForUser(conversation, myId);

      if (!force && unreadCount <= 0) {
        return false;
      }

      inflightRef.current.add(cid);
      cooldownRef.current.set(cid, now);
      setIsMarking(true);

      try {
        await chatAPI.markAsRead(cid);

        const me = buildSeenUser(user, myId);
        const seenAt = new Date().toISOString();

        queryClient.setQueryData(chatKeys.conversations(), (oldData) =>
          patchConversationUnread(oldData, cid, myId)
        );

        queryClient.setQueryData(chatKeys.messages(cid), (oldData) =>
          patchMessagesSeen(oldData, myId, me, seenAt)
        );

        return true;
      } finally {
        inflightRef.current.delete(cid);
        setIsMarking(false);
      }
    },
    [myId, queryClient, user]
  );

  return {
    markAsRead,
    isMarking,
  };
}

export default useMarkAsRead;