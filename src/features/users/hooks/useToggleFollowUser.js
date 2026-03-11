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

    onMutate: async (isFollowing) => {
      const statusKey = ['follow', 'user', 'status', userId];
      const profileKey = ['profile', userId];

      await queryClient.cancelQueries({ queryKey: statusKey });
      await queryClient.cancelQueries({ queryKey: profileKey });

      const previousStatus = queryClient.getQueryData(statusKey);
      const previousProfile = queryClient.getQueryData(profileKey);

      queryClient.setQueryData(statusKey, { isFollowing: !isFollowing });

      if (previousProfile) {
        queryClient.setQueryData(profileKey, {
          ...previousProfile,
          followersCount: isFollowing
            ? Math.max(0, (previousProfile.followersCount || 0) - 1)
            : (previousProfile.followersCount || 0) + 1,
        });
      }

      return { previousStatus, previousProfile, statusKey, profileKey };
    },

    onError: (err, variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(context.statusKey, context.previousStatus);
      }
      if (context?.previousProfile) {
        queryClient.setQueryData(context.profileKey, context.previousProfile);
      }
      toast.error(getErrorMessage(err));
    },

    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: context.statusKey });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: context.profileKey });
      }, 2000);
    },
  });

  return {
    toggle: mutation.mutate,
    isLoading: mutation.isPending,
  };
}