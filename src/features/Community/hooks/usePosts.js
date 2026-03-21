import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";

export const usePosts = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ["posts", { limit }],
    queryFn: ({ pageParam = null }) =>
      postAPI.getPosts({ cursor: pageParam, limit }),
    initialPageParam: null,

    getNextPageParam: (lastPage) => {
      console.log("Dữ liệu trang cuối:", lastPage);
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
