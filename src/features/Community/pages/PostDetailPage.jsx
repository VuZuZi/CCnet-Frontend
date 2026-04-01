import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { usePostDetail } from "../hooks/usePosts";
import { usePostMutations } from "../hooks/usePostMutations";
import PostTheaterMode from "../components/post/PostTheaterMode";
import TextOnlyPostView from "../components/post/TextOnlyPostView";

const formatTimeAgo = (d) => {
  const s = Math.floor((new Date() - new Date(d)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

const LoadingState = () => (
  <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-white font-medium animate-pulse">
      Loading post detail...
    </p>
  </div>
);

const ErrorState = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
    <div className="bg-white p-8 rounded-2xl shadow-sm max-w-sm">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-black mb-2">Post Not Found</h2>
      <p className="text-gray-500 mb-6">
        The post might have been deleted or is unavailable.
      </p>
      <Link
        to="/community"
        className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-400"
      >
        <FiArrowLeft /> Back to Community
      </Link>
    </div>
  </div>
);

export function PostDetailPage() {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const [commentContent, setCommentContent] = useState("");

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

  if (isLoading) return <LoadingState />;
  if (isError || !responseData?.data) return <ErrorState />;

  const currentPost = responseData.data;
  const mappedPost = {
    ...currentPost,
    id: currentPost._id,
    authorName:
      currentPost.author?.fullName ||
      currentPost.author?.username ||
      "Anonymous",
    timeAgo: formatTimeAgo(currentPost.createdAt),
    comments: currentPost.latestComments || currentPost.comments || [],
    userReaction: currentPost.userReaction,
    stats: currentPost.stats || { likes: 0, comments: 0 },
  };

  const hasMedia = mappedPost.images && mappedPost.images.length > 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="p-4 md:p-8 relative z-50">
        <Link
          to="/community"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <FiArrowLeft /> Back
        </Link>
      </div>
      {hasMedia ? (
        <PostTheaterMode post={mappedPost} onClose={handleClose} />
      ) : (
        <TextOnlyPostView
          post={mappedPost}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          handleCommentSubmit={handleCommentSubmit}
          toggleReaction={toggleReaction}
          addComment={addComment}
        />
      )}
    </div>
  );
}
