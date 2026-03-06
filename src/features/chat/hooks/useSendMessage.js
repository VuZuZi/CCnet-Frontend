import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../api/chatAPI';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const mutation = useMutation({
    mutationFn: chatAPI.sendMessage,

    onMutate: async (variables) => {
      const cid = String(variables?.conversationId || conversationId || '');
      if (!cid) return undefined;

      const tempId = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const now = new Date().toISOString();

      const tempMessage = {
        _id: tempId,
        conversationId: cid,
        senderId: myId || 'me',
        text: (variables?.text || '').trim(),
        attachments: Array.isArray(variables?.attachments)
          ? variables.attachments.map((f) => ({
              originalName: f?.name,
              mimetype: f?.type,
              size: f?.size,
              url: f?.name,
            }))
          : [],
        status: 'sending',
        createdAt: now,
        updatedAt: now,
        __optimistic: true,
      };

      await queryClient.cancelQueries({ queryKey: ['chat', 'messages', cid] });
      const previous = queryClient.getQueryData(['chat', 'messages', cid]);

      queryClient.setQueryData(['chat', 'messages', cid], (old = []) => {
        const arr = Array.isArray(old) ? old : [];
        return [...arr, tempMessage];
      });

      return { previous, cid, tempId };
    },

    onError: (error, _variables, ctx) => {
      if (ctx?.cid) {
        if (ctx.previous !== undefined) {
          queryClient.setQueryData(['chat', 'messages', ctx.cid], ctx.previous);
        } else {
          queryClient.setQueryData(['chat', 'messages', ctx.cid], (old = []) => {
            const arr = Array.isArray(old) ? old : [];
            return arr.filter((m) => m?._id !== ctx.tempId);
          });
        }
      }
      toast.error(getErrorMessage(error));
    },

    onSuccess: (message, _variables, ctx) => {
      const cid = ctx?.cid;
      if (!cid) return;

      if (!message?._id) return;

      queryClient.setQueryData(['chat', 'messages', cid], (old = []) => {
        const arr = Array.isArray(old) ? old : [];

        const replaced = arr.map((m) => (String(m?._id) === String(ctx?.tempId) ? message : m));
        const exists = replaced.some((m) => String(m?._id) === String(message?._id));
        return exists ? replaced : [...replaced, message];
      });

      queryClient.setQueryData(['chat', 'conversations'], (old = []) => {
        const arr = Array.isArray(old) ? old : [];
        return arr.map((c) =>
          String(c?._id) === String(cid)
            ? { ...c, lastMessage: message, updatedAt: message?.createdAt || c.updatedAt }
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
