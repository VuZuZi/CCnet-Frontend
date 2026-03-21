import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";

export const usePostMutations = () => {
  const queryClient = useQueryClient();

  const refreshPosts = (postId) => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    if (postId) queryClient.invalidateQueries({ queryKey: ["post", postId] });
  };

  const createPost = useMutation({
    mutationFn: (formData) => postAPI.createPost(formData),
    onSuccess: () => refreshPosts(),
  });

  const addComment = useMutation({
    mutationFn: ({ postId, content }) => postAPI.addComment(postId, content),
    onSuccess: (_, { postId }) => refreshPosts(postId),
  });

  const deletePost = useMutation({
    mutationFn: (postId) => postAPI.deletePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((post) => post._id !== postId),
          })),
        };
      });
      return { previousPosts };
    },
    onError: (err, id, context) =>
      queryClient.setQueryData(["posts"], context.previousPosts),
    onSettled: () => refreshPosts(),
  });

  const toggleReaction = useMutation({
    mutationFn: ({ postId, type }) => postAPI.toggleReaction(postId, type),
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) => {
              if (post._id !== postId) return post;

              let { likes = 0 } = post.stats || {};
              const currentReaction = post.userReaction;

              if (currentReaction === type) {
                if (type === "like") likes--;
              } else {
                if (type === "like") likes++;
                if (currentReaction === "like" && type === "dislike") likes--;
              }

              return {
                ...post,
                userReaction: currentReaction === type ? null : type,
                stats: { ...post.stats, likes: Math.max(0, likes) },
              };
            }),
          })),
        };
      });
      return { previousPosts };
    },
    onError: (err, vars, context) =>
      queryClient.setQueryData(["posts"], context.previousPosts),
    onSettled: () => refreshPosts(),
  });

  const updatePost = useMutation({
    mutationFn: ({ postId, formData }) => postAPI.updatePost(postId, formData),
    onSuccess: (_, { postId }) => refreshPosts(postId),
  });

  const reportPost = useMutation({
    mutationFn: ({ postId, formData }) => postAPI.reportPost(postId, formData),
  });

  return {
    createPost,
    reportPost,
    addComment,
    toggleReaction,
    updatePost,
    deletePost,
  };
};
