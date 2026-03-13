import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectChatSocket, CHAT_EVENTS } from '../lib/socketClient';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

function getSenderId(sender) {
  if (!sender) return '';
  if (typeof sender === 'string') return String(sender);
  return String(sender?._id || sender?.id || sender?.userId || '');
}

export function useChatSocket(conversationId) {
  const queryClient = useQueryClient();
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  useEffect(() => {
    const cid = String(conversationId || '');
    if (!cid) return undefined;

    const socket = connectChatSocket();

    const joinRoom = () => {
      socket.emit(CHAT_EVENTS.JOIN, cid, (ack) => {
        console.log('[frontend] join ack:', ack);
      });
    };

    const onConnect = () => {
      console.log('[frontend] joining room:', cid);
      joinRoom();
    };

    const onNewMessage = (payload) => {
      const incomingCid = String(payload?.conversationId || '');
      const message = payload?.message;

      if (!incomingCid || !message) return;
      if (incomingCid !== cid) return;

      queryClient.setQueryData(['chat', 'messages', incomingCid], (oldData) => {
        const arr = Array.isArray(oldData) ? oldData : [];

        const realId = String(message?._id || '');
        if (!realId) return arr;

        const existingIndex = arr.findIndex((m) => String(m?._id) === realId);
        if (existingIndex !== -1) {
          const next = [...arr];
          next[existingIndex] = { ...next[existingIndex], ...message, __optimistic: false };
          return next;
        }

        const senderId = getSenderId(message?.senderId);
        const text = String(message?.text || '').trim();
        const messageCreatedAt = message?.createdAt ? new Date(message.createdAt).getTime() : 0;

        const optimisticIndex = arr.findIndex((m) => {
          if (!m?.__optimistic) return false;

          const sameSender = getSenderId(m?.senderId) === senderId;
          const sameText = String(m?.text || '').trim() === text;
          const tempCreatedAt = m?.createdAt ? new Date(m.createdAt).getTime() : 0;
          const closeTime =
            messageCreatedAt && tempCreatedAt
              ? Math.abs(messageCreatedAt - tempCreatedAt) < 15000
              : true;

          return sameSender && sameText && closeTime;
        });

        if (optimisticIndex !== -1) {
          const next = [...arr];
          next[optimisticIndex] = { ...message, __optimistic: false };
          return next;
        }

        return [...arr, { ...message, __optimistic: false }];
      });

      queryClient.setQueryData(['chat', 'conversations'], (oldData) => {
        const arr = Array.isArray(oldData) ? oldData : [];
        const idx = arr.findIndex((c) => String(c?._id) === incomingCid);
        if (idx === -1) return arr;

        const current = arr[idx];
        const updated = {
          ...current,
          lastMessage: message,
          updatedAt: message?.createdAt || current?.updatedAt,
          unreadCounts: {
            ...(current?.unreadCounts || {}),
            ...(myId ? { [String(myId)]: 0 } : {}),
          },
        };

        return [updated, ...arr.filter((_, i) => i !== idx)];
      });
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on(CHAT_EVENTS.MESSAGE_NEW, onNewMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off(CHAT_EVENTS.MESSAGE_NEW, onNewMessage);
      socket.emit(CHAT_EVENTS.LEAVE, cid);
    };
  }, [conversationId, myId, queryClient]);
}