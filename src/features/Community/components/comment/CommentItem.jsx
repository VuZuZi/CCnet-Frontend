import { memo } from "react";
import { Heart, SendHorizonal } from "lucide-react";

const relativeFormatter = new Intl.RelativeTimeFormat("vi-VN", {
  numeric: "auto",
});

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffInSeconds);

  if (absSeconds < 60) return "vừa xong";
  if (absSeconds < 3600) {
    return relativeFormatter.format(Math.round(diffInSeconds / 60), "minute");
  }
  if (absSeconds < 86400) {
    return relativeFormatter.format(Math.round(diffInSeconds / 3600), "hour");
  }
  if (absSeconds < 604800) {
    return relativeFormatter.format(Math.round(diffInSeconds / 86400), "day");
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getAuthorName = (author) =>
  author?.fullName || author?.username || author?.name || "Người ẩn danh";

const getCommentId = (comment) => comment?._id || comment?.id || "";

const CommentItem = ({
  comment,
  isReply = false,
  targetCommentId = "",
  activeReplyId = "",
  replyValue = "",
  onReplyValueChange,
  onOpenReply,
  onCancelReply,
  onSubmitReply,
  onToggleLike,
  isSubmittingReply = false,
  activeLikeId = "",
}) => {
  if (!comment) return null;

  const authorName = getAuthorName(comment.author);
  const authorInitials = authorName.substring(0, 1).toUpperCase();
  const commentId = getCommentId(comment);
  const isTarget =
    !isReply &&
    targetCommentId &&
    String(commentId) === String(targetCommentId);
  const isReplying = String(activeReplyId) === String(commentId);
  const isLikePending = String(activeLikeId) === String(commentId);
  const hasLiked = Boolean(comment.likedByMe || comment.userReaction === "like");
  const likesCount = Number(comment.likesCount || 0);

  return (
    <article
      id={!isReply && commentId ? `comment-${commentId}` : undefined}
      className={`flex min-w-0 gap-3 rounded-3xl transition-colors duration-300 ${
        isReply ? "ml-4 mt-3 pl-3" : ""
      } ${isTarget ? "bg-amber-50 p-3 ring-1 ring-amber-200" : ""}`}
    >
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-slate-200 font-bold text-slate-600 shadow-sm ${
          isReply ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs"
        }`}
      >
        {comment.author?.avatar ? (
          <img
            src={comment.author.avatar}
            alt={authorName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          authorInitials
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`inline-block max-w-full rounded-3xl px-4 py-3 ${
            isReply ? "border border-slate-100 bg-white" : "bg-slate-100/80"
          }`}
        >
          <div className="mb-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <h4 className="min-w-0 truncate text-sm font-black text-slate-900">
              {authorName}
            </h4>
            {comment.createdAt ? (
              <span className="shrink-0 text-[11px] font-medium text-slate-400">
                {formatTimeAgo(comment.createdAt)}
              </span>
            ) : null}
          </div>

          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
            {comment.content}
          </p>
        </div>

        <div className="ml-3 mt-1.5 flex items-center gap-4 text-[11px] font-bold text-slate-500">
          <button
            type="button"
            onClick={() => onToggleLike?.(comment)}
            disabled={isLikePending}
            className={`inline-flex items-center gap-1 transition hover:text-amber-700 disabled:cursor-wait disabled:opacity-60 ${
              hasLiked ? "text-rose-600" : ""
            }`}
          >
            <Heart size={12} fill={hasLiked ? "currentColor" : "none"} />
            <span>Thích</span>
            {likesCount > 0 ? <span>({likesCount})</span> : null}
          </button>
          <button
            type="button"
            onClick={() => onOpenReply?.(comment)}
            className="transition hover:text-slate-700"
          >
            Trả lời
          </button>
        </div>

        {isReplying ? (
          <form
            onSubmit={(event) => onSubmitReply?.(event, comment)}
            className="ml-3 mt-2 flex items-end gap-2"
          >
            <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-slate-300 focus-within:bg-white">
              <textarea
                value={replyValue}
                onChange={(event) => onReplyValueChange?.(event.target.value)}
                rows={1}
                disabled={isSubmittingReply}
                placeholder={`Phản hồi ${authorName}...`}
                className="max-h-24 min-h-6 w-full resize-none border-none bg-transparent text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={!replyValue.trim() || isSubmittingReply}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              aria-label="Gửi trả lời"
            >
              <SendHorizonal size={14} />
            </button>
            <button
              type="button"
              onClick={onCancelReply}
              className="text-[11px] font-bold text-slate-500 transition hover:text-slate-800"
            >
              Hủy
            </button>
          </form>
        ) : null}

        {Array.isArray(comment.replies)
          ? comment.replies.map((reply) => (
              <CommentItem
                key={getCommentId(reply)}
                comment={reply}
                isReply
                targetCommentId={targetCommentId}
                activeReplyId={activeReplyId}
                replyValue={replyValue}
                onReplyValueChange={onReplyValueChange}
                onOpenReply={onOpenReply}
                onCancelReply={onCancelReply}
                onSubmitReply={onSubmitReply}
                onToggleLike={onToggleLike}
                isSubmittingReply={isSubmittingReply}
                activeLikeId={activeLikeId}
              />
            ))
          : null}
      </div>
    </article>
  );
};

export default memo(CommentItem);
