import { useQuery } from '@tanstack/react-query';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';
import { getErrorMessage } from '@/shared/lib/httpClient';

const CONVERSATIONS_REFETCH_INTERVAL = 5000;

export function useConversations() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);

  const query = useQuery({
    queryKey: chatKeys.conversations(),
    enabled: Boolean(isAuthenticated && !isAuthLoading),
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: (queryState) => {
      if (!isAuthenticated || isAuthLoading) return false;
      if (typeof document !== 'undefined' && document.hidden) return false;
      if (queryState.state.status === 'error') return false;
      return CONVERSATIONS_REFETCH_INTERVAL;
    },
    queryFn: async () => {
      const data = await chatAPI.getConversations();
      return Array.isArray(data) ? data : [];
    },
  });

  return {
    conversations: Array.isArray(query.data) ? query.data : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}

export default useConversations;