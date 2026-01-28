import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";
import { queryKeys } from "@/shared/constants/queryKeys";
import { useToast } from "@/shared/contexts/ToastContext";

export const usePostMutations = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const createPostMutation = useMutation({
    mutationFn: postAPI.createPost,
    onSuccess: () => {
      toast.success("Post created successfully!");
      queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const reactionMutation = useMutation({
    mutationFn: postAPI.toggleReaction,
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: [queryKeys.posts] });

      const previousPosts = queryClient.getQueryData([queryKeys.posts]);

      queryClient.setQueryData([queryKeys.posts], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((post) => {
              if (post._id === postId) {
                const currentReaction = post.userReaction;
                const isCurrentlyLiked = currentReaction === 'like';
                
                const isRemoving = currentReaction === type;
                
                let newReaction = isRemoving ? null : type;
                let likeChange = 0;

                if (type === 'like') {
                    if (isCurrentlyLiked) {
                        likeChange = -1;
                    } else {
                        likeChange = 1;
                    }
                }


                return {
                  ...post,
                  userReaction: newReaction,
                  stats: {
                    ...post.stats,
                    likes: Math.max(0, (post.stats?.likes || 0) + likeChange) 
                  }
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousPosts };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData([queryKeys.posts], context.previousPosts);
      }
      toast.error("Failed to react to post");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: postAPI.addComment, 
    onSuccess: (newComment, variables) => {
       queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(variables.postId) });
       queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });
    },
    onError: (error) => {
        toast.error("Failed to post comment");
    }
  });

  return { createPostMutation, reactionMutation, addCommentMutation };
};