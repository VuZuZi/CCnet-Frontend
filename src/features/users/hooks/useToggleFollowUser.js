import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followAPI } from '../api/followAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';

export function useToggleFollowUser(userId) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: async (isFollowing) => {
      if (isFollowing) return followAPI.unfollowUser(userId);
      return followAPI.followUser(userId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['follow', 'user', 'status', userId] });
      queryClient.invalidateQueries({ queryKey: ['follow', 'user', 'stats', userId] });

      const ok = !!data?.isFollowing;
      toast.success(ok ? 'Followed' : 'Unfollowed');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    toggle: mutation.mutate,
    toggleAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
