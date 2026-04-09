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

      // 🚨 Hàm tính toán số Like mới cực kỳ rõ ràng, không lồng ngoằng
      const calculateNewStats = (post) => {
        let likes = post.stats?.likes || 0;
        const currentReaction = post.userReaction;

        if (type === "like") {
          if (currentReaction === "like") {
            likes -= 1; // Đang like bấm phát nữa -> Bỏ like
          } else {
            likes += 1; // Đang null hoặc dislike bấm like -> Thêm like
          }
        } else if (type === "dislike") {
          if (currentReaction === "like") {
            likes -= 1; // Đang like mà quay xe sang dislike -> Mất 1 like
          }
          // Nếu đang null hoặc đang dislike mà bấm dislike -> Số like không bị ảnh hưởng
        }

        return {
          ...post,
          userReaction: currentReaction === type ? null : type, // Bấm lại chính nút đó thì hủy (null)
          stats: { ...post.stats, likes: Math.max(0, likes) }, // Đảm bảo Like không bao giờ âm
        };
      };

      // Áp dụng cho danh sách Posts (Trang chủ)
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
      // Có lỗi thì khôi phục lại dữ liệu cũ ngay lập tức
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

  return {
    createPost,
    reportPost,
    addComment,
    toggleReaction,
    updatePost,
    deletePost,
  };
};
