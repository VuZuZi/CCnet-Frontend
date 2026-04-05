import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followAPI } from "../../users/api/followAPI";
import { userAPI } from "../../users/api/userAPI";

export const useSuggestedUsers = (limit = 5) => {
  return useQuery({
    queryKey: ["suggestedUsers", limit],
    queryFn: () => userAPI.getSuggestedUsers(limit),
    staleTime: 1000 * 60 * 10,
  });
};

export const useFollowStatus = (userId) => {
  return useQuery({
    queryKey: ["followStatus", userId],
    queryFn: () => followAPI.statusUser(userId),
    enabled: !!userId,
  });
};

export const useMyFollowing = (limit = 50) => {
  return useQuery({
    queryKey: ["myFollowing", limit],
    queryFn: () => followAPI.getMyFollowing(limit),
  });
};

export const useFollowMutations = () => {
  const queryClient = useQueryClient();

  const follow = useMutation({
    mutationFn: (userId) => followAPI.followUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["myFollowing"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
    },
  });

  const unfollow = useMutation({
    mutationFn: (userId) => followAPI.unfollowUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["myFollowing"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["follow"] });
    },
  });

  const toggleProjectFollow = useMutation({
    mutationFn: (projectId) => followAPI.toggleProjectFollow(projectId),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });
      const previousProject = queryClient.getQueryData(["project", projectId]);

      if (previousProject) {
        queryClient.setQueryData(["project", projectId], (old) => {
          if (!old) return old;

          const isCurrentlyFollowing = old.isFollowing;
          const currentFollowerCount = old.stats?.followerCount || 0;

          return {
            ...old,
            isFollowing: !isCurrentlyFollowing,
            stats: {
              ...old.stats,
              followerCount: isCurrentlyFollowing
                ? Math.max(0, currentFollowerCount - 1)
                : currentFollowerCount + 1,
            },
          };
        });
      }
      return { previousProject };
    },
    onError: (err, projectId, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(
          ["project", projectId],
          context.previousProject,
        );
      }
    },
    onSettled: (_, __, projectId) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }, 1500);
    },
  });

  return { follow, unfollow, toggleProjectFollow };
};
