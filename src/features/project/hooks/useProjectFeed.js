import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI } from '../api/projectAPI';

export function useProjectFeedPosts(projectId, { limit = 10 } = {}) {
  return useInfiniteQuery({
    queryKey: ['projectFeedPosts', projectId],
    queryFn: ({ pageParam }) =>
      projectAPI.getFeedPosts(projectId, { limit, cursor: pageParam || null }),
    enabled: !!projectId,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
  });
}

export function useCreateProjectFeedPost(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectAPI.createFeedPost(projectId, data),
    onSuccess: (created) => {
      queryClient.setQueryData(['projectFeedPosts', projectId], (old) => {
        if (!old) return old;
        const firstPage = old.pages?.[0];
        if (!firstPage) return old;
        return {
          ...old,
          pages: [
            { ...firstPage, posts: [created, ...(firstPage.posts || [])] },
            ...old.pages.slice(1),
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
      queryClient.setQueryData(['projectFeedPosts', projectId], (old) => {
        if (!old) return old;
        const nextPages = old.pages.map((page) => {
          const posts = (page.posts || []).map((p) => {
            if (String(p._id) !== String(variables.postId)) return p;
            const nextLatest = [created, ...(p.latestComments || [])].slice(0, 2);
            return {
              ...p,
              commentsCount: Number(p.commentsCount || 0) + 1,
              latestComments: nextLatest,
            };
          });
          return { ...page, posts };
        });
        return { ...old, pages: nextPages };
      });
    },
  });
}

export function useToggleProjectFeedPostLike(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId) => projectAPI.toggleFeedPostLike(projectId, postId),
    onSuccess: (res, postId) => {
      const updatedPost = res?.post;
      if (!updatedPost) return;
      queryClient.setQueryData(['projectFeedPosts', projectId], (old) => {
        if (!old) return old;
        const nextPages = old.pages.map((page) => {
          const posts = (page.posts || []).map((p) =>
            String(p._id) === String(postId) ? { ...p, ...updatedPost } : p,
          );
          return { ...page, posts };
        });
        return { ...old, pages: nextPages };
      });
    },
  });
}

export function useToggleProjectFeedCommentLike(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => projectAPI.toggleFeedCommentLike(projectId, commentId),
    onSuccess: (res, commentId) => {
      const updatedComment = res?.comment;
      if (!updatedComment) return;
      queryClient.setQueryData(['projectFeedPosts', projectId], (old) => {
        if (!old) return old;
        const nextPages = old.pages.map((page) => {
          const posts = (page.posts || []).map((p) => {
            const nextLatest = (p.latestComments || []).map((c) =>
              String(c._id) === String(commentId) ? { ...c, ...updatedComment } : c,
            );
            return { ...p, latestComments: nextLatest };
          });
          return { ...page, posts };
        });
        return { ...old, pages: nextPages };
      });
    },
  });
}

