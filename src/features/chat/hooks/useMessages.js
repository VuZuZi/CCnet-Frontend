import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../api/chatAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

export function useMessages(conversationId) {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);
  const user = useAuthStore(authSelectors.user);

  const cid = String(conversationId || '');
  const enabled = Boolean(cid && isAuthenticated && !isAuthLoading && user);

  const query = useQuery({
    queryKey: ['chat', 'messages', cid],
    enabled,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const list = await chatAPI.getMessages(cid);
      return Array.isArray(list) ? list : [];
    },
  });

  return {
    messages: Array.isArray(query.data) ? query.data : [],
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}