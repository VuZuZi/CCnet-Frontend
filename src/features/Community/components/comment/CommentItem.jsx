import React from "react";

const formatTimeAgo = (dateString) => {
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return "vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  return `${Math.floor(diffInHours / 24)} ngày trước`;
};

const CommentItem = ({ comment, isReply = false, targetCommentId = "" }) => {
  if (!comment) return null;

  const authorName =
    comment.author?.fullName || comment.author?.username || "Người ẩn danh";
  const authorInitials = authorName.substring(0, 1).toUpperCase();
  const commentId = comment._id || comment.id || "";
  const isTarget =
    !isReply &&
    targetCommentId &&
    String(commentId) === String(targetCommentId);

  return (
    <div
      id={!isReply && commentId ? `comment-${commentId}` : undefined}
      className={`flex w-full min-w-0 space-x-3 transition-all duration-300 ${
        isReply ? "mt-3 border-l-2 border-yellow-100 pl-3" : ""
      } ${isTarget ? "rounded-2xl bg-yellow-50/70 p-2" : ""}`}
    >
      <div
        className={`${
          isReply ? "size-7 text-[10px]" : "size-8 text-xs"
        } rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold shrink-0`}
      >
        {authorInitials}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`p-3 rounded-2xl max-w-full inline-block ${
            isReply ? "bg-gray-50 border border-yellow-50" : "bg-gray-100"
          }`}
        >
          <div className="flex items-center space-x-2 mb-0.5">
            <h4 className="text-xs font-bold text-gray-900 truncate">
              {authorName}
            </h4>
            <span className="text-[10px] text-gray-400 font-normal shrink-0">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-800 leading-snug break-words break-all whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-1 ml-2 text-[11px] font-bold text-gray-500">
          <button className="hover:text-yellow-600 transition-colors">
            Thích
          </button>
          <button className="hover:text-yellow-600 transition-colors">
            Trả lời
          </button>
        </div>

        {comment.replies?.map((reply) => (
          <CommentItem
            key={reply._id || reply.id}
            comment={reply}
            isReply={true}
            targetCommentId={targetCommentId}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentItem;
