import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import PostCard from "@/features/Community/components/PostCard";
import { usePostDetail } from "@/features/Community/hooks/usePosts";

export default function SearchPostModal({ open, item, onClose }) {
  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id || null;

  const postId = item?.id || item?.payload?._id || null;

  const {
    data: postData,
    isLoading,
    isError,
  } = usePostDetail(postId);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !postId) return null;

  const post = postData?.data || postData || null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="sticky top-3 ml-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-lg">
            Đang tải bài viết...
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-white p-8 text-center text-red-500 shadow-lg">
            Không tải được chi tiết bài viết.
          </div>
        ) : post ? (
          <PostCard
            post={post}
            currentUserId={currentUserId}
            onReport={(postId) => {
              console.log("Report post from search modal:", postId);
            }}
          />
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-lg">
            Không tìm thấy bài viết.
          </div>
        )}
      </div>
    </div>
  );
}