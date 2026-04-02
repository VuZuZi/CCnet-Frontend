import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';
import {
  appendMessage,
  removeMessageById,
  replaceOptimisticMessage,
} from '@/features/chat/utils/cache.messages';
import { upsertConversationWithLastMessage } from '@/features/chat/utils/cache.conversations';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

function buildOptimisticAttachments(files = []) {
  return (Array.isArray(files) ? files : []).map((file) => ({
    filename: file?.name || '',
    originalName: file?.name || '',
    mimetype: file?.type || '',
    size: file?.size || 0,
    previewUrl: file?.type?.startsWith('image/') ? URL.createObjectURL(file) : '',
    url: '',
    __localFile: true,
  }));
}

function revokeOptimisticAttachmentPreviews(message) {
  const attachments = Array.isArray(message?.attachments) ? message.attachments : [];

  attachments.forEach((item) => {
    if (!item?.previewUrl) return;

    try {
      URL.revokeObjectURL(item.previewUrl);
    } catch {
      // ignore revoke failure
    }
  });
}

function buildOptimisticSender(user, myId) {
  return {
    _id: myId,
    id: myId,
    userId: myId,
    fullName: user?.fullName || user?.username || user?.email || 'Bạn',
    email: user?.email || '',
    avatar: user?.avatar || '',
  };
}

function buildOptimisticMessage({
  cid,
  tempId,
  now,
  myId,
  user,
  text,
  files,
  replyToMessage,
}) {
  return {
    _id: tempId,
    conversationId: cid,
    senderId: buildOptimisticSender(user, myId),
    text: String(text || '').trim(),
    attachments: buildOptimisticAttachments(files || []),
    links: [],
    replyTo: replyToMessage || null,
    reactions: [],
    seenBy: [],
    status: 'sending',
    messageType: 'user',
    isUnsent: false,
    createdAt: now,
    updatedAt: now,
    __optimistic: true,
  };
}

function patchConversationAfterSend(oldData, cid, message, myId) {
  return upsertConversationWithLastMessage(oldData, cid, message, {
    unreadUpdater: (unreadCounts) => {
      unreadCounts[String(myId)] = 0;
      return unreadCounts;
    },
  });
}

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id || 'me';

  const mutation = useMutation({
    mutationFn: async (payload) => chatAPI.sendMessage(payload),

    onMutate: async (payload) => {
      const cid = String(payload?.conversationId || conversationId || '');
      const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();

      const optimisticMessage = buildOptimisticMessage({
        cid,
        tempId,
        now,
        myId,
        user,
        text: payload?.text,
        files: payload?.files,
        replyToMessage: payload?.replyToMessage,
      });

      queryClient.setQueryData(chatKeys.messages(cid), (oldData) =>
        appendMessage(oldData, optimisticMessage)
      );

      queryClient.setQueryData(chatKeys.conversations(), (oldData) =>
        patchConversationAfterSend(oldData, cid, optimisticMessage, myId)
      );

      return {
        cid,
        tempId,
        optimisticMessage,
      };
    },

    onSuccess: (message, _payload, context) => {
      const cid = String(
        context?.cid || conversationId || message?.conversationId || ''
      );

      queryClient.setQueryData(chatKeys.messages(cid), (oldData) =>
        replaceOptimisticMessage(oldData, message)
      );

      queryClient.setQueryData(chatKeys.conversations(), (oldData) =>
        patchConversationAfterSend(oldData, cid, message, myId)
      );

      revokeOptimisticAttachmentPreviews(context?.optimisticMessage);
    },

    onError: (error, _payload, context) => {
      const cid = String(context?.cid || conversationId || '');

      queryClient.setQueryData(chatKeys.messages(cid), (oldData) =>
        removeMessageById(oldData, context?.tempId)
      );

      revokeOptimisticAttachmentPreviews(context?.optimisticMessage);
      toast.error(getErrorMessage(error));
    },
  });

  return {
    sendMessage: mutation.mutate,
    sendMessageAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export default useSendMessage;