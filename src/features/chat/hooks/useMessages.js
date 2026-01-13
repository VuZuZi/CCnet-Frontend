import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../api/chatAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

export function useMessages(conversationId) {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);
  const user = useAuthStore(authSelectors.user);

  const enabled = Boolean(conversationId && isAuthenticated && !isAuthLoading && user);

  const query = useQuery({
    queryKey: ['chat', 'messages', String(conversationId || '')],
    enabled,
    retry: false,
    staleTime: 5_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const list = await chatAPI.getMessages(conversationId);
      return Array.isArray(list) ? list : [];
    },
  });

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
