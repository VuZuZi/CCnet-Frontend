import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';

function removePinnedItem(list, messageId) {
  const safeList = Array.isArray(list) ? list : [];
  const targetId = String(messageId || '');

  return safeList.filter(
    (entry) => String(entry?.messageId || entry?.message?._id || '') !== targetId
  );
}

export function useUnpinMessage(conversationId) {
  const queryClient = useQueryClient();
  const cid = String(conversationId || '');

  const mutation = useMutation({
    mutationFn: async ({ messageId }) => {
      return chatAPI.unpinMessage(cid, messageId);
    },
    onSuccess: (data, variables) => {
      const targetId = String(data?.messageId || variables?.messageId || '');
      queryClient.setQueryData(chatKeys.pinnedMessages(cid), (oldData) =>
        removePinnedItem(oldData, targetId)
      );
    },
  });

  return {
    unpinMessageAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export default useUnpinMessage; 