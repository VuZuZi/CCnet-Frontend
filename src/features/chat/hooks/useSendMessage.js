import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../api/chatAPI';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

function normalizeMySender(user) {
  return user?.userId || user?._id || user?.id || 'me';
}

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const user = useAuthStore(authSelectors.user);
  const myId = normalizeMySender(user);

  const mutation = useMutation({
    mutationFn: chatAPI.sendMessage,

    onMutate: async (variables) => {
      const cid = String(variables?.conversationId || conversationId || '');
      if (!cid) return undefined;

      const text = String(variables?.text || '').trim();
      const files = Array.isArray(variables?.attachments) ? variables.attachments : [];

      if (!text && files.length === 0) return undefined;

      const tempId = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const now = new Date().toISOString();

      const tempMessage = {
        _id: tempId,
        conversationId: cid,
        senderId: myId,
        text,
        attachments: files.map((file) => ({
          originalName: file?.name || '',
          mimetype: file?.type || '',
          size: file?.size || 0,
          url: file?.name || '',
        })),
        status: 'sending',
        createdAt: now,
        updatedAt: now,
        __optimistic: true,
      };

      await queryClient.cancelQueries({ queryKey: ['chat', 'messages', cid] });

      const previousMessages = queryClient.getQueryData(['chat', 'messages', cid]);
      const previousConversations = queryClient.getQueryData(['chat', 'conversations']);

      queryClient.setQueryData(['chat', 'messages', cid], (old = []) => {
        const arr = Array.isArray(old) ? old : [];
        return [...arr, tempMessage];
      });

      queryClient.setQueryData(['chat', 'conversations'], (old = []) => {
        const arr = Array.isArray(old) ? old : [];
        return arr.map((c) =>
          String(c?._id) === cid
            ? {
                ...c,
                lastMessage: tempMessage,
                updatedAt: now,
              }
            : c
        );
      });

      return {
        cid,
        tempId,
        previousMessages,
        previousConversations,
      };
    },

    onError: (error, _variables, ctx) => {
      if (ctx?.cid) {
        if (ctx.previousMessages !== undefined) {
          queryClient.setQueryData(['chat', 'messages', ctx.cid], ctx.previousMessages);
        }

        if (ctx.previousConversations !== undefined) {
          queryClient.setQueryData(['chat', 'conversations'], ctx.previousConversations);
        }
      }

      toast.error(getErrorMessage(error));
    },

    onSuccess: (message, _variables, ctx) => {
      const cid = String(ctx?.cid || '');
      if (!cid || !message?._id) return;

      queryClient.setQueryData(['chat', 'messages', cid], (old = []) => {
        const arr = Array.isArray(old) ? old : [];

        const exactIndex = arr.findIndex((m) => String(m?._id) === String(message?._id));
        if (exactIndex !== -1) {
          const next = [...arr];
          next[exactIndex] = { ...message, __optimistic: false };
          return next;
        }

        const tempIndex = arr.findIndex((m) => String(m?._id) === String(ctx?.tempId));
        if (tempIndex !== -1) {
          const next = [...arr];
          next[tempIndex] = { ...message, __optimistic: false };
          return next;
        }

        return arr;
      });

      queryClient.setQueryData(['chat', 'conversations'], (old = []) => {
        const arr = Array.isArray(old) ? old : [];
        return arr.map((c) =>
          String(c?._id) === cid
            ? {
                ...c,
                lastMessage: message,
                updatedAt: message?.createdAt || c?.updatedAt,
              }
            : c
        );
      });
    },
  });

  return {
    sendMessage: mutation.mutate,
    sendMessageAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}