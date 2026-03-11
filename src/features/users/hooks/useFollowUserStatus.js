import { useQuery } from '@tanstack/react-query';
import { followAPI } from '../api/followAPI';

export function useFollowUserStatus(userId) {
  const enabled = !!userId;

  const q = useQuery({
    queryKey: ['follow', 'user', 'status', userId],
    queryFn: () => followAPI.statusUser(userId),
    enabled,
    staleTime: 60 * 1000, 
  });

  return {
    isFollowing: !!q.data?.isFollowing,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
  };
}