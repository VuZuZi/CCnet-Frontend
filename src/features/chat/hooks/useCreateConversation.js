import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../api/chatAPI';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useChatStore } from '../stores/useChatStore';

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const openConversation = useChatStore((s) => s.openConversation);

  const mutation = useMutation({
    mutationFn: chatAPI.createConversation,
    onSuccess: (convo) => {
      if (convo?._id) openConversation(convo._id);
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      toast.success('Conversation ready');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    createConversation: mutation.mutate,
    createConversationAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
