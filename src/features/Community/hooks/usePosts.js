import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";

export const usePosts = (limit = 10, feedType = "for-you", options = {}) => {
  const profileUserId = options?.profileUserId || null;

  return useInfiniteQuery({
    queryKey: ["posts", limit, feedType, profileUserId],

    queryFn: ({ pageParam = null }) => {
      const params = { limit };
      if (pageParam) params.cursor = pageParam;

      if (feedType === "saved") {
        return postAPI.getSavedPosts(params);
      }
      if (feedType === "following") {
        params.type = "following";
      }
      if (feedType === "profile" && profileUserId) {
        params.type = "profile";
        params.profileUserId = profileUserId;
      }

      return postAPI.getPosts(params);
    },

    initialPageParam: null,

    getNextPageParam: (lastPage) => {
      if (lastPage.message?.hasMore === false) return undefined;
      return lastPage.message?.nextCursor || undefined;
    },

    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePostDetail = (postId) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => postAPI.getPostById(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 5,
  });
};
