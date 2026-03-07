import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { postAPI } from '../api/postAPI';

export const usePosts = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = null }) => postAPI.getPosts({ cursor: pageParam, limit }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.paging?.hasMore) return undefined;
      return lastPage.paging.nextCursor;
    },
  });
};

export const usePostDetail = (postId) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => postAPI.getPostById(postId),
    enabled: !!postId,
  });
};