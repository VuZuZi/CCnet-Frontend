import { useQuery } from '@tanstack/react-query';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';
import { getErrorMessage } from '@/shared/lib/httpClient';

export function useMessages(conversationId) {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);
  const user = useAuthStore(authSelectors.user);

  const cid = String(conversationId || '');
  const enabled = Boolean(cid && isAuthenticated && !isAuthLoading && user);

  const query = useQuery({
    queryKey: chatKeys.messages(cid),
    enabled,
    retry: false,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const list = await chatAPI.getMessages(cid);
      return Array.isArray(list) ? list : [];
    },
  });

  return {
    messages: Array.isArray(query.data) ? query.data : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}

export default useMessages;