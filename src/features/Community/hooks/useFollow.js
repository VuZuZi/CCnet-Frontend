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

    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["myFollowing"] });
      const previousFollowing = queryClient.getQueryData(["myFollowing"]);

      queryClient.setQueryData(["myFollowing"], (oldData) => {
        if (!oldData) return oldData;
        if (oldData.users) {
          return {
            ...oldData,
            users: oldData.users.filter((item) => {
              const currentId =
                item.followingId?._id ||
                item.followingId?.id ||
                item._id ||
                item.id;
              return currentId !== userId;
            }),
          };
        }

        if (Array.isArray(oldData)) {
          return oldData.filter((item) => {
            const currentId =
              item.followingId?._id ||
              item.followingId?.id ||
              item._id ||
              item.id;
            return currentId !== userId;
          });
        }

        return oldData;
      });

      return { previousFollowing };
    },

    onError: (err, userId, context) => {
      if (context?.previousFollowing) {
        queryClient.setQueryData(["myFollowing"], context.previousFollowing);
      }
    },

    onSettled: (_, error, userId) => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["myFollowing"] });
    },
  });

  return { follow, unfollow };
};
