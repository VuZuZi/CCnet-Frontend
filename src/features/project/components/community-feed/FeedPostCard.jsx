import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  BadgeCheck,
} from "lucide-react";

import FeedUserAvatar from "./FeedUserAvatar";
import FeedMediaPreview from "./FeedMediaPreview";
import FeedCommentList from "./FeedCommentList";
import {
  formatProjectFeedDateTime,
  getProjectFeedFirstMedia,
  normalizeProjectFeedId,
} from "./utils/projectFeed.utils";

export function FeedPostCard({
  post,
  projectOrganizerId,
  user,
  canEngage,
  commentDraft,
  onCommentDraftChange,
  onCreateComment,
  onTogglePostLike,
  onToggleCommentLike,
  createComment,
  togglePostLike,
  toggleCommentLike,
  toast,
  engageLockedPlaceholder,
}) {
  const organizerBadge =
    normalizeProjectFeedId(post?.author?._id || post?.author?.id || post?.author) ===
    projectOrganizerId;

  const media = getProjectFeedFirstMedia(post);

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <FeedUserAvatar user={post.author} />

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h4 className="truncate font-bold text-slate-900">
                {post.author?.fullName || "Người dùng"}
              </h4>

              {post.author?.isVerified ? (
                <BadgeCheck size={16} className="text-blue-500" title="Đã xác minh" />
              ) : null}

              {organizerBadge ? (
                <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  Ban tổ chức
                </span>
              ) : null}
            </div>

            <span className="text-xs text-slate-500">
              {formatProjectFeedDateTime(post.createdAt)}
            </span>
          </div>
        </div>

        <button type="button" className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <p className="whitespace-pre-wrap break-words text-slate-700 [overflow-wrap:anywhere]">
        {post.content}
      </p>

      {media ? <FeedMediaPreview media={media} /> : null}

      <div className="flex items-center gap-6 border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={() => {
            if (!canEngage) {
              toast.error("Bạn cần đăng nhập để thả tim.");
              return;
            }
            onTogglePostLike(post._id);
          }}
          disabled={togglePostLike.isPending}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            post.likedByMe ? "text-red-500" : "text-slate-500 hover:text-red-500"
          }`}
          title={canEngage ? "Thả tim bài viết" : "Đăng nhập để thả tim"}
        >
          <Heart size={18} />
          {Number(post.likesCount || 0)}
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-blue-500"
        >
          <MessageCircle size={18} />
          {Number(post.commentsCount || 0)}
        </button>
      </div>

      <FeedCommentList
        comments={post.latestComments || []}
        user={user}
        postId={post._id}
        canEngage={canEngage}
        commentDraft={commentDraft}
        onCommentDraftChange={onCommentDraftChange}
        onCreateComment={onCreateComment}
        onToggleCommentLike={onToggleCommentLike}
        createComment={createComment}
        toggleCommentLike={toggleCommentLike}
        toast={toast}
        engageLockedPlaceholder={engageLockedPlaceholder}
      />
    </div>
  );
}

export default FeedPostCard;
