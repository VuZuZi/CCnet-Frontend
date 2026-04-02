import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";

export const usePostMutations = () => {
  const queryClient = useQueryClient();

  const refreshPosts = (postId) => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    if (postId) queryClient.invalidateQueries({ queryKey: ["post", postId] });
  };

  const updatePagesHelper = (oldData, updater) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        data: updater(page.data),
      })),
    };
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

      queryClient.setQueryData(["posts"], (old) =>
        updatePagesHelper(old, (data) =>
          data.filter((post) => post._id !== postId),
        ),
      );

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
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousPosts = queryClient.getQueryData(["posts"]);
      const previousSinglePost = queryClient.getQueryData(["post", postId]);

      queryClient.setQueryData(["posts"], (old) =>
        updatePagesHelper(old, (data) =>
          data.map((post) => {
            if (post._id !== postId) return post;

            let likes = post.stats?.likes || 0;
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
        ),
      );

      if (previousSinglePost) {
        queryClient.setQueryData(["post", postId], (old) => {
          if (!old || !old.data) return old;

          let likes = old.data.stats?.likes || 0;
          const currentReaction = old.data.userReaction;

          if (currentReaction === type) {
            if (type === "like") likes--;
          } else {
            if (type === "like") likes++;
            if (currentReaction === "like" && type === "dislike") likes--;
          }

          return {
            ...old,
            data: {
              ...old.data,
              userReaction: currentReaction === type ? null : type,
              stats: { ...old.data.stats, likes: Math.max(0, likes) },
            },
          };
        });
      }

      return { previousPosts, previousSinglePost };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(["posts"], context.previousPosts);
      if (context.previousSinglePost) {
        queryClient.setQueryData(
          ["post", vars.postId],
          context.previousSinglePost,
        );
      }
    },
    onSettled: (_, __, vars) => refreshPosts(vars.postId),
  });

  const updatePost = useMutation({
    mutationFn: ({ postId, formData }) => postAPI.updatePost(postId, formData),
    onSuccess: (_, { postId }) => refreshPosts(postId),
  });

  const reportPost = useMutation({
    mutationFn: ({ postId, payload }) =>
      postAPI.reportPost({ postId, payload }),
    onError: () => {},
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
