import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectAPI } from "../api/projectAPI";
import { PROJECT_FEED_QUERY_KEYS } from "./useProjectQueries";

const updateFeedInfiniteCache = (queryClient, projectId, updater) => {
  queryClient.setQueryData(PROJECT_FEED_QUERY_KEYS.posts(projectId), (oldData) => {
    if (!oldData) return oldData;
    return updater(oldData);
  });
};

const mapFeedPages = (oldData, pageUpdater) => ({
  ...oldData,
  pages: (oldData.pages || []).map(pageUpdater),
});

export function useProjectFeedPosts(projectId, { limit = 10 } = {}) {
  return useInfiniteQuery({
    queryKey: PROJECT_FEED_QUERY_KEYS.posts(projectId),
    queryFn: ({ pageParam }) =>
      projectAPI.getFeedPosts(projectId, { limit, cursor: pageParam || null }),
    enabled: Boolean(projectId),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
  });
}

export function useCreateProjectFeedPost(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => projectAPI.createFeedPost(projectId, data),
    onSuccess: (created) => {
      updateFeedInfiniteCache(queryClient, projectId, (oldData) => {
        const firstPage = oldData.pages?.[0];
        if (!firstPage) return oldData;

        return {
          ...oldData,
          pages: [
            {
              ...firstPage,
              posts: [created, ...(firstPage.posts || [])],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });
}

export function useCreateProjectFeedComment(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }) =>
      projectAPI.createFeedComment(projectId, postId, { content }),
    onSuccess: (created, variables) => {
      updateFeedInfiniteCache(queryClient, projectId, (oldData) =>
        mapFeedPages(oldData, (page) => ({
          ...page,
          posts: (page.posts || []).map((post) => {
            if (String(post._id) !== String(variables.postId)) {
              return post;
            }

            return {
              ...post,
              commentsCount: Number(post.commentsCount || 0) + 1,
              latestComments: [created, ...(post.latestComments || [])].slice(0, 2),
            };
          }),
        })),
      );
    },
  });
}

export function useToggleProjectFeedPostLike(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => projectAPI.toggleFeedPostLike(projectId, postId),
    onSuccess: (response, postId) => {
      const updatedPost = response?.post;
      if (!updatedPost) return;

      updateFeedInfiniteCache(queryClient, projectId, (oldData) =>
        mapFeedPages(oldData, (page) => ({
          ...page,
          posts: (page.posts || []).map((post) =>
            String(post._id) === String(postId)
              ? { ...post, ...updatedPost }
              : post,
          ),
        })),
      );
    },
  });
}

export function useToggleProjectFeedCommentLike(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId) =>
      projectAPI.toggleFeedCommentLike(projectId, commentId),
    onSuccess: (response, commentId) => {
      const updatedComment = response?.comment;
      if (!updatedComment) return;

      updateFeedInfiniteCache(queryClient, projectId, (oldData) =>
        mapFeedPages(oldData, (page) => ({
          ...page,
          posts: (page.posts || []).map((post) => ({
            ...post,
            latestComments: (post.latestComments || []).map((comment) =>
              String(comment._id) === String(commentId)
                ? { ...comment, ...updatedComment }
                : comment,
            ),
          })),
        })),
      );
    },
  });
}