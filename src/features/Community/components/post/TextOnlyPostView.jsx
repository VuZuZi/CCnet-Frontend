import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const SharedEntityCard = ({ entity }) => {
  if (!entity) return null;
  const isProject = entity.entityModel === "Project";
  const linkTo = isProject
    ? `/projects/${entity.entityId}`
    : `/need-help/${entity.entityId}`;
  const badgeClass = isProject ? "bg-blue-600" : "bg-red-500";
  const btnClass = isProject
    ? "bg-blue-50 text-blue-700 border-blue-100"
    : "bg-red-50 text-red-700 border-red-100";

  return (
    <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col sm:flex-row relative">
      <div className="w-full sm:w-[160px] h-[140px] sm:h-auto shrink-0 bg-slate-200 border-b sm:border-b-0 sm:border-r border-slate-200 relative">
        {entity.thumbnail ? (
          <img
            src={entity.thumbnail}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            No Image
          </div>
        )}
        <span
          className={`absolute top-2 left-2 px-2 py-1 text-[9px] font-bold uppercase rounded-md shadow-sm text-white ${badgeClass}`}
        >
          {isProject ? "PROJECT" : "NEED HELP"}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1 bg-white">
        <h4 className="font-bold text-slate-900 line-clamp-2 mb-1.5">
          {entity.title}
        </h4>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
          {entity.description || "Nhấn để xem chi tiết..."}
        </p>
        <div className="mt-auto">
          <Link
            to={linkTo}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-colors border hover:opacity-80 ${btnClass}`}
          >
            {isProject ? "Xem Dự Án" : "Giúp Đỡ Ngay"}
            <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const TextOnlyPostView = ({
  post,
  commentContent,
  setCommentContent,
  handleCommentSubmit,
  toggleReaction,
  addComment,
}) => {
  const isLiked = post.userReaction === "like";
  const isDisliked = post.userReaction === "dislike";

  return (
    <div className="flex flex-col items-center justify-center px-4 pb-8 min-h-[80vh]">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 shrink-0">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{post.authorName}</h3>
            <p className="text-sm text-slate-500">
              {post.timeAgo} • {post.privacy}
            </p>
          </div>
        </div>

        <div className="prose prose-slate prose-lg max-w-none whitespace-pre-wrap leading-relaxed text-slate-800">
          {post.content}
        </div>

        <SharedEntityCard entity={post.sharedEntity} />

        <div className="flex items-center gap-6 py-4 border-t border-b border-slate-100 mt-6 mb-6">
          <button
            onClick={() =>
              toggleReaction.mutate({ postId: post.id, type: "like" })
            }
            className={`flex items-center gap-2 font-bold text-sm transition-all hover:opacity-70 ${isLiked ? "text-yellow-500" : "text-slate-500"}`}
          >
            <span
              className={`material-symbols-outlined ${isLiked ? "fill-current" : ""}`}
            >
              favorite
            </span>
            {post.stats.likes} Likes
          </button>

          <button
            onClick={() =>
              toggleReaction.mutate({ postId: post.id, type: "dislike" })
            }
            className={`flex items-center gap-2 font-bold text-sm transition-all hover:opacity-70 ${isDisliked ? "text-red-500" : "text-slate-500"}`}
          >
            <span
              className={`material-symbols-outlined ${isDisliked ? "fill-current" : ""}`}
            >
              thumb_down
            </span>
          </button>

          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm ml-auto">
            <span className="material-symbols-outlined">chat_bubble</span>{" "}
            {post.stats.comments} Comments
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 mb-4">
            Comments ({post.comments.length})
          </h4>
          <div className="flex flex-col gap-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                  {(comment.author?.fullName || comment.author?.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="text-sm bg-slate-50 px-4 py-3 rounded-2xl flex-1 border border-slate-100">
                  <span className="font-bold text-slate-900 mr-2">
                    {comment.author?.fullName ||
                      comment.author?.username ||
                      "Anonymous"}
                  </span>
                  <span className="text-slate-700">{comment.content}</span>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>

          <form
            onSubmit={handleCommentSubmit}
            className="flex gap-3 items-center"
          >
            <input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-full bg-slate-50 border border-slate-200 py-2.5 px-5 text-sm outline-none focus:ring-2 focus:ring-yellow-500/30"
            />
            <button
              type="submit"
              disabled={addComment.isPending || !commentContent.trim()}
              className="bg-yellow-500 text-black text-sm font-bold py-2.5 px-6 rounded-full hover:bg-yellow-400 disabled:opacity-50 transition-colors"
            >
              {addComment.isPending ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TextOnlyPostView;
