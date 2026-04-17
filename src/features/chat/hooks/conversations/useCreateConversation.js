import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';
import { useChatStore } from '@/features/chat/stores/useChatStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const openConversation = useChatStore((state) => state.openConversation);

  const mutation = useMutation({
    mutationFn: chatAPI.createConversation,
    onSuccess: (conversation) => {
      if (conversation?._id) {
        openConversation(conversation._id);
      }

      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      toast.success('Đã tạo cuộc trò chuyện');
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

export default useCreateConversation;