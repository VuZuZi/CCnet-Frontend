import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";

export const usePosts = (limit = 10, feedType = "for-you") => {
  return useInfiniteQuery({
    queryKey: ["posts", limit, feedType],

    queryFn: ({ pageParam = null }) => {
      const params = { limit };
      if (pageParam) params.cursor = pageParam;

      if (feedType === "saved") {
        return postAPI.getSavedPosts(params);
      }
      if (feedType === "following") {
        params.type = "following";
      }

      return postAPI.getPosts(params);
    },

    initialPageParam: null,

    getNextPageParam: (lastPage) => {
      console.log("Dữ liệu trang cuối:", lastPage); // Chỉ là log để debug, nhưng mình cứ dịch cho bạn nha
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
