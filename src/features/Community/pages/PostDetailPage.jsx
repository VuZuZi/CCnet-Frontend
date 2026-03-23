import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { usePostDetail } from "../hooks/usePosts";
import PostTheaterMode from "../components/PostTheaterMode";

const formatTimeAgo = (dateString) => {
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return `${Math.floor(diffInDays / 7)}w ago`;
};

export function PostDetailPage() {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { data: responseData, isLoading, isError } = usePostDetail(postId);
  const handleClose = () => {
    navigate("/community");
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[100]">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-medium animate-pulse">
          Loading post detail...
        </p>
      </div>
    );
  }

  if (isError || !responseData?.data) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-light-gray max-w-sm">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-black mb-2">Post Not Found</h2>
          <p className="text-gray mb-6">
            The post you are looking for might have been deleted or is
            temporarily unavailable.
          </p>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 bg-yellow text-black px-6 py-2 rounded-full font-bold hover:bg-yellow/90 transition-all"
          >
            <FiArrowLeft /> Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const currentPost = responseData.data;
  return (
    <div className="min-h-screen bg-gray-100/50">
      <div className="p-4 md:p-8">
        <Link
          to="/community"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black"
        >
          <FiArrowLeft /> Back
        </Link>
      </div>

      <PostTheaterMode
        post={{
          ...currentPost,
          id: currentPost._id,
          authorName:
            currentPost.author?.fullName ||
            currentPost.author?.username ||
            "Anonymous",
          timeAgo: formatTimeAgo(currentPost.createdAt),
          comments: currentPost.latestComments || currentPost.comments || [],
        }}
        onClose={handleClose}
      />
    </div>
  );
}
