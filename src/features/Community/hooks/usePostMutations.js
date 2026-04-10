import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";
import { useToast } from "@/shared/contexts/ToastContext";

export const usePostMutations = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

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
          data.map((post) =>
            post._id === postId || post.id === postId
              ? { ...post, isSaved: !post.isSaved }
              : post,
          ),
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

      const calculateNewStats = (post) => {
        let likes = post.stats?.likes || 0;
        const currentReaction = post.userReaction;

        if (type === "like") {
          if (currentReaction === "like") {
            likes -= 1;
          } else {
            likes += 1;
          }
        } else if (type === "dislike") {
          if (currentReaction === "like") {
            likes -= 1;
          }
        }

        return {
          ...post,
          userReaction: currentReaction === type ? null : type,
          stats: { ...post.stats, likes: Math.max(0, likes) },
        };
      };

      queryClient.setQueryData(["posts"], (old) =>
        updatePagesHelper(old, (data) =>
          data.map((post) =>
            post._id === postId ? calculateNewStats(post) : post,
          ),
        ),
      );

      // Áp dụng cho 1 Post cụ thể (Trang chi tiết)
      if (previousSinglePost) {
        queryClient.setQueryData(["post", postId], (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: calculateNewStats(old.data),
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
      toast.error("Không thể tương tác. Vui lòng thử lại!");
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
  const toggleSavePost = useMutation({
    mutationFn: (postId) => postAPI.toggleSave(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousPosts = queryClient.getQueryData(["posts"]);
      const previousSinglePost = queryClient.getQueryData(["post", postId]);

      queryClient.setQueryData(["posts"], (old) =>
        updatePagesHelper(old, (data) =>
          data.map((post) =>
            post._id === postId ? { ...post, isSaved: !post.isSaved } : post,
          ),
        ),
      );

      if (previousSinglePost) {
        queryClient.setQueryData(["post", postId], (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: { ...old.data, isSaved: !old.data.isSaved },
          };
        });
      }

      return { previousPosts, previousSinglePost };
    },
    onError: (err, postId, context) => {
      // Nếu lỗi mạng, trả lại trạng thái cũ
      queryClient.setQueryData(["posts"], context.previousPosts);
      if (context.previousSinglePost) {
        queryClient.setQueryData(["post", postId], context.previousSinglePost);
      }
      toast.error("Không thể lưu bài viết. Vui lòng thử lại!");
    },
    onSettled: (_, __, postId) => refreshPosts(postId),
  });
  return {
    createPost,
    reportPost,
    addComment,
    toggleReaction,
    updatePost,
    deletePost,
    toggleSavePost,
  };
};
