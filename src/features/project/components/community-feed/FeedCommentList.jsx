import { Heart, BadgeCheck } from "lucide-react";
import FeedUserAvatar from "./FeedUserAvatar";
import FeedCommentComposer from "./FeedCommentComposer";
import { formatProjectFeedDateTime } from "./utils/projectFeed.utils";

export function FeedCommentList({
  comments = [],
  user,
  postId,
  canEngage,
  commentDraft,
  onCommentDraftChange,
  onCreateComment,
  onToggleCommentLike,
  createComment,
  toggleCommentLike,
  toast,
  engageLockedPlaceholder,
}) {
  return (
    <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
      {comments.map((comment) => (
        <div key={comment._id} className="flex gap-3">
          <FeedUserAvatar user={comment.author} size="sm" />

          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-none border border-slate-100 bg-white p-3">
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-bold text-slate-900">
                  {comment.author?.fullName || "Người dùng"}
                </span>

                {comment.author?.isVerified ? (
                  <BadgeCheck
                    size={14}
                    className="flex-shrink-0 text-blue-500"
                    title="Đã xác minh"
                  />
                ) : null}

                <span className="flex-shrink-0 text-xs text-slate-500">
                  {formatProjectFeedDateTime(comment.createdAt)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!canEngage) {
                    toast.error(
                      "Chỉ chủ dự án hoặc tình nguyện viên đã được duyệt mới có thể thả tim.",
                    );
                    return;
                  }
                  onToggleCommentLike(comment._id);
                }}
                disabled={toggleCommentLike.isPending}
                className={`flex items-center gap-1 text-xs font-bold ${
                  comment.likedByMe
                    ? "text-red-500"
                    : "text-slate-400 hover:text-red-500"
                }`}
                title={canEngage ? "Thả tim bình luận" : "Bạn không có quyền thả tim"}
              >
                <Heart size={14} />
                {Number(comment.likesCount || 0)}
              </button>
            </div>

            <p className="whitespace-pre-wrap break-words text-sm text-slate-600 [overflow-wrap:anywhere]">
              {comment.content}
            </p>
          </div>
        </div>
      ))}

      <FeedCommentComposer
        user={user}
        postId={postId}
        canEngage={canEngage}
        value={commentDraft}
        onChange={onCommentDraftChange}
        onSubmit={onCreateComment}
        isPending={createComment.isPending}
        engageLockedPlaceholder={engageLockedPlaceholder}
      />
    </div>
  );
}

export default FeedCommentList;