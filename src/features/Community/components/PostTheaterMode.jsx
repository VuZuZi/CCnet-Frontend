import React, { useState } from "react";
import MediaViewer from "./MediaViewer";
import CommentItem from "./CommentItem";
import { usePostMutations } from "../hooks/usePostMutations";

const PostTheaterMode = ({ post, onClose }) => {
  const [commentContent, setCommentContent] = useState("");
  const { addComment } = usePostMutations();

  if (!post) return null;

  const authorName =
    post.author?.fullName || post.author?.username || "Anonymous";
  const authorInitials = authorName.substring(0, 1).toUpperCase();
  const comments = post.latestComments || post.comments || [];

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || addComment.isPending) return;

    try {
      await addComment.mutateAsync({
        postId: post._id,
        content: commentContent,
      });
      setCommentContent("");
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm sm:p-4 md:p-10">
      <div className="w-full max-w-7xl bg-white shadow-2xl flex flex-col md:flex-row h-full md:h-[90vh] overflow-hidden md:rounded-2xl">
        <MediaViewer images={post.images} onClose={onClose} />

        <section className="w-full md:w-[420px] flex flex-col bg-white border-l border-gray-100">
          <header className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-sm shrink-0">
                {authorInitials}
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 leading-tight">
                  {authorName}
                </h4>
                <p className="text-[11px] text-gray-400 uppercase tracking-tighter">
                  Community Member
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <article className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">
              {post.content}
            </article>

            <div className="flex items-center justify-between py-2 border-y border-gray-50 mb-6">
              <span className="text-xs font-bold text-gray-500">
                {comments.length} Bình luận
              </span>
              <span className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">
                    Chưa có bình luận nào.
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <CommentItem key={comment._id} comment={comment} />
                ))
              )}
            </div>
          </div>

          <footer className="p-4 border-t border-gray-100 bg-gray-50/50">
            <form
              onSubmit={handlePostComment}
              className="flex items-center space-x-2"
            >
              <div className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-100 transition-all">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="w-full bg-transparent border-none focus:ring-0 text-sm"
                  disabled={addComment.isPending}
                />
              </div>
              <button
                type="submit"
                disabled={!commentContent.trim() || addComment.isPending}
                className="text-yellow-600 font-bold text-sm px-2 disabled:opacity-40 hover:text-yellow-700 transition-colors"
              >
                {addComment.isPending ? "..." : "Gửi"}
              </button>
            </form>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default PostTheaterMode;
