import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";
import { queryKeys } from "@/shared/constants/queryKeys";

export const usePostDetail = (postId) => {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postAPI.getPostById(postId),
    enabled: !!postId, 
    staleTime: 5 * 60 * 1000, 
  });
};

export const usePostComments = (postId) => {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: async ({ pageParam = 1 }) => {
      return await postAPI.getComments(postId, { page: pageParam });
    },
    getNextPageParam: (lastPage, allPages) => {
       return lastPage.data?.length === 10 ? allPages.length + 1 : undefined;
    },
    enabled: !!postId,
  });
};