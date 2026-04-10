import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followAPI } from "../../users/api/followAPI";
import { userAPI } from "../../users/api/userAPI";

const projectDetailKeys = (projectId) => [
  ["projects", "detail", projectId],
  ["project", projectId],
];

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
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const unfollow = useMutation({
    mutationFn: (userId) => followAPI.unfollowUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["myFollowing"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["follow"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const toggleProjectFollow = useMutation({
    mutationFn: (projectId) => followAPI.toggleProjectFollow(projectId),
    onMutate: async (projectId) => {
      const detailKeys = projectDetailKeys(projectId);

      await Promise.all(
        detailKeys.map((key) => queryClient.cancelQueries({ queryKey: key })),
      );

      const previousSnapshots = detailKeys.map((key) => ({
        key,
        data: queryClient.getQueryData(key),
      }));

      detailKeys.forEach((key) => {
        queryClient.setQueryData(key, (old) => {
          if (!old) return old;

          const isCurrentlyFollowing = Boolean(old.isFollowing);
          const currentFollowerCount = Number(old.stats?.followerCount || 0);

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
      });

      return { previousSnapshots };
    },
    onError: (_err, _projectId, context) => {
      (context?.previousSnapshots || []).forEach(({ key, data }) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, projectId) => {
      const detailKeys = projectDetailKeys(projectId);

      detailKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["myFollowing"] });
    },
  });

  return { follow, unfollow, toggleProjectFollow };
};