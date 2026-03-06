import { useQuery } from '@tanstack/react-query';
import { followAPI } from '../api/followAPI';

export function useFollowUserStats(userId) {
  const enabled = !!userId && String(userId).length === 24;

  const q = useQuery({
    queryKey: ['follow', 'user', 'stats', userId],
    queryFn: () => followAPI.statsUser(userId),
    enabled,
    staleTime: 0,
  });

  return {
    followers: q.data?.followers ?? 0,
    following: q.data?.following ?? 0,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
  };
}
