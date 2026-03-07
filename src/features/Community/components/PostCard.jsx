import { useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { usePostMutations } from "../hooks/usePostMutations";
import { Button } from "@/shared/components/ui/Button/Button";

// Helper function
const getAuthorName = (author) => author?.fullName || author?.username || "Anonymous";

export function PostCard({ post, currentUserId, onReport }) {
  const [commentContent, setCommentContent] = useState("");
  const { toggleReaction, addComment } = usePostMutations();

  const isLiked = post.userReaction === 'like';
  const isDisliked = post.userReaction === 'dislike';
  const likeCount = post.stats?.likes || 0;
  const commentCount = post.stats?.comments || 0;
  const authorInitials = getAuthorName(post.author).charAt(0).toUpperCase();

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    addComment.mutate({ postId: post._id, content: commentContent });
    setCommentContent("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-light-gray relative overflow-hidden mb-6">
      <button
        className="absolute top-4 right-4 z-10 text-gray hover:text-[#dc3545] p-2 bg-white/80 backdrop-blur-sm rounded-full cursor-pointer"
        onClick={() => onReport(post._id)}
      >
        <FiAlertTriangle size={16} />
      </button>

      <div className="p-5 md:p-6">
        <div className="flex items-center mb-4">
          <div className="bg-yellow text-black font-bold flex items-center justify-center rounded-full mr-3 w-11 h-11 shrink-0">
            {authorInitials}
          </div>
          <h6 className="m-0 font-bold text-[1.05rem]">{getAuthorName(post.author)}</h6>
        </div>

        <Link to={`/community/${post._id}`} className="no-underline text-black block mb-4">
          <p className="mb-4 text-base whitespace-pre-wrap">{post.content}</p>
          {post.images?.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] auto-rows-[200px] gap-2">
              {post.images.map((img, i) => (
                <img key={i} src={img.url} alt="post_image" className="w-full h-full object-cover rounded-lg" loading="lazy" />
              ))}
            </div>
          )}
        </Link>

        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={() => toggleReaction.mutate({ postId: post._id, type: 'like' })}
            disabled={!currentUserId || toggleReaction.isPending}
            className={`flex items-center gap-2 p-0 bg-transparent border-none text-base cursor-pointer ${isLiked ? "text-yellow font-bold" : "text-gray"}`}
          >
            👍 {likeCount}
          </button>
          <button
            onClick={() => toggleReaction.mutate({ postId: post._id, type: 'dislike' })}
            disabled={!currentUserId || toggleReaction.isPending}
            className={`flex items-center gap-2 p-0 bg-transparent border-none text-base cursor-pointer ${isDisliked ? "text-[#dc3545] font-bold" : "text-gray"}`}
          >
            👎 
          </button>
          <span className="text-gray text-sm font-medium">💬 {commentCount} comments</span>
        </div>

        <div className="border-t border-light-gray pt-4 mt-2">
          {post.latestComments?.length > 0 && (
            <div className="flex flex-col gap-3 mb-3">
              {post.latestComments.map((comment) => (
                <div key={comment._id} className="text-sm bg-[#fafafa] p-3 rounded-xl">
                  <strong>{getAuthorName(comment.author)}</strong>: {comment.content}
                </div>
              ))}
            </div>
          )}
          
          {currentUserId && (
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <input
                type="text"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full border border-light-gray py-2 px-4 text-sm"
              />
              <Button type="submit" variant="yellow" className="!py-2 !px-5 !rounded-full">Send</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}