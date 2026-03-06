import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../api/chatAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

export function useConversations() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);

  const query = useQuery({
    queryKey: ['chat', 'conversations'],
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
    conversations: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
