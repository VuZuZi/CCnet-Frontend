import React, { useEffect, useMemo, useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { usePostDetail } from "../hooks/usePosts";
import { usePostMutations } from "../hooks/usePostMutations";
import PostTheaterMode from "../components/post/PostTheaterMode";
import TextOnlyPostView from "../components/post/TextOnlyPostView";

const formatTimeAgo = (d) => {
  const s = Math.floor((new Date() - new Date(d)) / 1000);
  if (s < 60) return "vừa xong";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} ngày trước`;
  return `${Math.floor(days / 7)} tuần trước`;
};

const LoadingState = () => (
  <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-white font-medium animate-pulse">
      Đang tải chi tiết bài viết...
    </p>
  </div>
);

const ErrorState = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
    <div className="bg-white p-8 rounded-2xl shadow-sm max-w-sm">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-black mb-2">
        Không tìm thấy bài viết
      </h2>
      <p className="text-gray-500 mb-6">
        Bài viết có thể đã bị xóa hoặc không còn tồn tại.
      </p>
      <Link
        to="/community"
        className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-400"
      >
        <FiArrowLeft /> Quay lại Cộng đồng
      </Link>
    </div>
  </div>
);

function highlightAndScrollToComment(commentId) {
  if (!commentId) return;

  const targetId = `comment-${commentId}`;
  let attempts = 0;
  const maxAttempts = 12;

  const run = () => {
    const element = document.getElementById(targetId);

    if (!element) {
      attempts += 1;
      if (attempts < maxAttempts) {
        window.setTimeout(run, 250);
      }
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    element.classList.add(
      "ring-2",
      "ring-yellow-400",
      "ring-offset-2",
      "rounded-2xl",
    );
    window.setTimeout(() => {
      element.classList.remove(
        "ring-2",
        "ring-yellow-400",
        "ring-offset-2",
        "rounded-2xl",
      );
    }, 2500);
  };

  run();
}

export function PostDetailPage() {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [commentContent, setCommentContent] = useState("");

  const targetCommentId = searchParams.get("commentId") || "";

  const { data: responseData, isLoading, isError } = usePostDetail(postId);
  const { addComment, toggleReaction } = usePostMutations();

  const handleClose = () => navigate("/community");

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    addComment.mutate(
      { postId, content: commentContent },
      { onSuccess: () => setCommentContent("") },
    );
  };

  const currentPost = responseData?.data || null;

  const mappedPost = useMemo(() => {
    if (!currentPost) return null;

    return {
      ...currentPost,
      id: currentPost._id,
      authorName:
        currentPost.author?.fullName ||
        currentPost.author?.username ||
        "Người ẩn danh",
      timeAgo: formatTimeAgo(currentPost.createdAt),
      comments: currentPost.latestComments || currentPost.comments || [],
      userReaction: currentPost.userReaction,
      stats: currentPost.stats || { likes: 0, comments: 0 },
    };
  }, [currentPost]);

  useEffect(() => {
    if (!mappedPost || !targetCommentId) return;
    highlightAndScrollToComment(targetCommentId);
  }, [mappedPost, targetCommentId]);

  if (isLoading) return <LoadingState />;
  if (isError || !responseData?.data || !mappedPost) return <ErrorState />;

  const hasMedia = mappedPost.images && mappedPost.images.length > 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="p-4 md:p-8 relative z-50">
        <Link
          to="/community"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <FiArrowLeft /> Quay lại
        </Link>
      </div>

      {hasMedia ? (
        <PostTheaterMode
          post={mappedPost}
          onClose={handleClose}
          targetCommentId={targetCommentId}
        />
      ) : (
        <TextOnlyPostView
          post={mappedPost}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          handleCommentSubmit={handleCommentSubmit}
          toggleReaction={toggleReaction}
          addComment={addComment}
          targetCommentId={targetCommentId}
        />
      )}
    </div>
  );
}
