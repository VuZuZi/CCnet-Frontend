import { useQuery } from '@tanstack/react-query';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';
import { getErrorMessage } from '@/shared/lib/httpClient';

export function useConversations() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);

  const query = useQuery({
    queryKey: chatKeys.conversations(),
    enabled: Boolean(isAuthenticated && !isAuthLoading),
    retry: false,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const data = await chatAPI.getConversations();
      return Array.isArray(data) ? data : [];
    },
  });

  return {
    conversations: Array.isArray(query.data) ? query.data : [],
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}

export default useConversations;