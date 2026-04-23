import { MessageCircle } from "lucide-react";
import CommentItem from "./CommentItem";
import { COMMENT_SORT_OPTIONS, getCommentId, getSortLabel } from "../../utils/comment.utils";

export default function CommentList({
  comments,
  totalComments,
  sortMode,
  isSortOpen,
  onToggleSort,
  onSortChange,
  sortRef,
  targetCommentId = "",
  hasMoreComments = false,
  isLoadingMore = false,
  onLoadMore,
  activeReplyId = "",
  replyValue = "",
  onReplyValueChange,
  onOpenReply,
  onCancelReply,
  onSubmitReply,
  onToggleLike,
  isSubmittingReply = false,
  activeLikeId = "",
}) {
  return (
    <section className="mt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900">
            Bình luận ({totalComments})
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Theo dõi trao đổi mới nhất trong bài viết.
          </p>
        </div>

        <div className="relative shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800"
          >
            {getSortLabel(sortMode)}
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>

          {isSortOpen ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
              {COMMENT_SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    sortMode === option.value
                      ? "bg-amber-50 text-amber-800"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <MessageCircle size={20} />
          </div>
          <p className="text-sm font-bold text-slate-700">
            Chưa có bình luận nào.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Hãy là người đầu tiên mở cuộc trò chuyện.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={getCommentId(comment)}
              comment={comment}
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
          ))}
        </div>
      )}

      {hasMoreComments ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isLoadingMore ? "Đang tải..." : "Xem thêm bình luận"}
        </button>
      ) : null}
    </section>
  );
}
