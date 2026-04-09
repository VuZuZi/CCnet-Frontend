import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';

function upsertPinnedItem(list, item) {
  const safeList = Array.isArray(list) ? list : [];
  const messageId = String(item?.messageId || item?.message?._id || '');

  const filtered = safeList.filter(
    (entry) => String(entry?.messageId || entry?.message?._id || '') !== messageId
  );

  return [item, ...filtered];
}

export function usePinMessage(conversationId) {
  const queryClient = useQueryClient();
  const cid = String(conversationId || '');

  const mutation = useMutation({
    mutationFn: async ({ messageId }) => {
      return chatAPI.pinMessage(cid, messageId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(chatKeys.pinnedMessages(cid), (oldData) =>
        upsertPinnedItem(oldData, data)
      );
    },
  });

  return {
    pinMessageAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export default usePinMessage;