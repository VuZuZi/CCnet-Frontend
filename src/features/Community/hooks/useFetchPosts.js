import { useInfiniteQuery } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";
import { queryKeys } from "@/shared/constants/queryKeys"; 

export const useFetchPosts = () => {
  return useInfiniteQuery({
    queryKey: [queryKeys.posts], 
    queryFn: async ({ pageParam }) => {
      return await postAPI.getNewsFeed({ cursor: pageParam, limit: 10 });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.paging?.hasMore ? lastPage.paging.nextCursor : undefined;
    },
    initialPageParam: null, 
  });
};