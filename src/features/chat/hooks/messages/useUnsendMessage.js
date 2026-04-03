import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';
import { patchConversationLastMessage } from '@/features/chat/utils/cache.conversations';
import { replaceMessageById } from '@/features/chat/utils/cache.messages';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

function resolveMessageId(payload) {
  if (typeof payload === 'string') return payload;
  return payload?.messageId || payload?._id || '';
}

export function useUnsendMessage(conversationId) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return chatAPI.unsendMessage(resolveMessageId(payload));
    },

    onSuccess: (message) => {
      const cid = String(conversationId || message?.conversationId || '');
      if (!cid || !message?._id) return;

      queryClient.setQueryData(chatKeys.messages(cid), (oldData) =>
        replaceMessageById(oldData, message)
      );

      queryClient.setQueryData(chatKeys.conversations(), (oldData) =>
        patchConversationLastMessage(oldData, cid, message)
      );
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    unsendMessage: mutation.mutate,
    unsendMessageAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export default useUnsendMessage;