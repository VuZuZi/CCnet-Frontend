import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAPI } from '../api/postAPI';

export const usePostMutations = () => {
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (formData) => postAPI.createPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const reportPostMutation = useMutation({
    mutationFn: ({ postId, formData }) => postAPI.reportPost(postId, formData),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }) => postAPI.addComment(postId, content),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: ({ postId, type }) => postAPI.toggleReaction(postId, type),
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts'], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((post) => {
              if (post._id !== postId) return post;
              
              let newLikes = post.stats?.likes || 0;
              let currentUserReaction = post.userReaction;

              if (currentUserReaction === type) {
                currentUserReaction = null;
                if (type === 'like') newLikes -= 1;
              } else {
                if (type === 'like') newLikes += 1;
                if (currentUserReaction === 'like' && type === 'dislike') newLikes -= 1;
                currentUserReaction = type;
              }

              return {
                ...post,
                userReaction: currentUserReaction,
                stats: { ...post.stats, likes: Math.max(0, newLikes) },
              };
            }),
          })),
        };
      });

      return { previousPosts };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    createPost: createPostMutation,
    reportPost: reportPostMutation,
    addComment: addCommentMutation,
    toggleReaction: toggleReactionMutation,
  };
};