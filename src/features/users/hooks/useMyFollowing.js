import { useQuery } from '@tanstack/react-query';
import { followAPI } from '../api/followAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';

export function useMyFollowing(limit = 50) {
  const q = useQuery({
    queryKey: ['follow', 'me', 'following', limit],
    queryFn: () => followAPI.getMyFollowing(limit),
    staleTime: 0,
  });

  return {
    items: Array.isArray(q.data) ? q.data : [],
    isLoading: q.isLoading,
    isError: q.isError,
    errorMessage: q.error ? getErrorMessage(q.error) : null,
    refetch: q.refetch,
  };
}
