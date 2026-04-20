import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../api/postAPI";
import { useToast } from "@/shared/contexts/ToastContext";

export const usePostMutations = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  /**
   * Làm mới tất cả các query liên quan đến bài viết.
   * Vì hệ thống là unified (1 nguồn dữ liệu),
   * khi tạo/sửa/xóa bài → phải invalidate CẢ Community feed VÀ Profile feed.
   */
  const refreshAllPosts = (postId) => {
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

  /**
   * Optimistic update helper: cập nhật tất cả cached queries có key bắt đầu bằng ["posts"]
   * để đảm bảo Community feed + Profile feed đồng bộ
   */
  const updateAllPostsCaches = (updater) => {
    const allPostsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
    allPostsQueries.forEach(([queryKey]) => {
      queryClient.setQueryData(queryKey, (old) =>
        updatePagesHelper(old, updater),
      );
    });
  };

  const createPost = useMutation({
    mutationFn: (formData) => postAPI.createPost(formData),
    onSuccess: () => {
      toast.success("Đã đăng bài viết thành công!");
      refreshAllPosts();
    },
    onError: () => {
      toast.error("Không thể đăng bài. Vui lòng thử lại sau!");
    },
  });

  const addComment = useMutation({
    mutationFn: ({ postId, content }) => postAPI.addComment(postId, content),
    onSuccess: (_, { postId }) => refreshAllPosts(postId),
  });

  const deletePost = useMutation({
    mutationFn: (postId) => postAPI.deletePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Lưu tất cả trạng thái cũ
      const previousQueries = queryClient.getQueriesData({ queryKey: ["posts"] });

      // Ẩn bài viết ngay lập tức khỏi TẤT CẢ feeds (Community + Profile)
      updateAllPostsCaches((data) =>
        data.filter((post) => post._id !== postId && post.id !== postId),
      );

      return { previousQueries };
    },
    onError: (err, id, context) => {
      // Khôi phục tất cả caches nếu lỗi
      context.previousQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Không thể xóa bài viết. Vui lòng thử lại!");
    },
    onSuccess: () => {
      toast.success("Đã xóa bài viết thành công!");
    },
    onSettled: () => refreshAllPosts(),
  });

  const toggleReaction = useMutation({
    mutationFn: ({ postId, type }) => postAPI.toggleReaction(postId, type),
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
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

      // Cập nhật optimistic cho TẤT CẢ feeds
      updateAllPostsCaches((data) =>
        data.map((post) =>
          post._id === postId ? calculateNewStats(post) : post,
        ),
      );

      // Cập nhật cho trang chi tiết post
      if (previousSinglePost) {
        queryClient.setQueryData(["post", postId], (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: calculateNewStats(old.data),
          };
        });
      }

      return { previousQueries, previousSinglePost };
    },
    onError: (err, vars, context) => {
      context.previousQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context.previousSinglePost) {
        queryClient.setQueryData(
          ["post", vars.postId],
          context.previousSinglePost,
        );
      }
      toast.error("Không thể tương tác. Vui lòng thử lại!");
    },
    onSettled: (_, __, vars) => refreshAllPosts(vars.postId),
  });

  const updatePost = useMutation({
    mutationFn: ({ postId, formData }) => postAPI.updatePost(postId, formData),
    onSuccess: (_, { postId }) => {
      toast.success("Đã cập nhật bài viết!");
      refreshAllPosts(postId);
    },
    onError: () => {
      toast.error("Không thể cập nhật bài viết. Vui lòng thử lại!");
    },
  });

  const reportPost = useMutation({
    mutationFn: ({ postId, payload }) =>
      postAPI.reportPost({ postId, payload }),
    onSuccess: () => {
      toast.success("Đã gửi báo cáo thành công!");
    },
    onError: () => {
      toast.error("Không thể gửi báo cáo. Vui lòng thử lại!");
    },
  });

  const toggleSavePost = useMutation({
    mutationFn: (postId) => postAPI.toggleSave(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      const previousSinglePost = queryClient.getQueryData(["post", postId]);

      // Cập nhật optimistic cho TẤT CẢ feeds
      updateAllPostsCaches((data) =>
        data.map((post) =>
          post._id === postId ? { ...post, isSaved: !post.isSaved } : post,
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

      return { previousQueries, previousSinglePost };
    },
    onError: (err, postId, context) => {
      context.previousQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context.previousSinglePost) {
        queryClient.setQueryData(["post", postId], context.previousSinglePost);
      }
      toast.error("Không thể lưu bài viết. Vui lòng thử lại!");
    },
    onSettled: (_, __, postId) => refreshAllPosts(postId),
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
