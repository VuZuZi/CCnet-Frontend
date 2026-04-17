import FeedUserAvatar from "./FeedUserAvatar";

export function FeedCommentComposer({
  user,
  postId,
  canEngage,
  value,
  onChange,
  onSubmit,
  isPending,
  engageLockedPlaceholder,
}) {
  return (
    <div className="flex gap-3 pt-2">
      <FeedUserAvatar user={user} size="sm" />

      <div className="flex flex-1 items-center gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:bg-slate-100"
          placeholder={canEngage ? "Viết bình luận..." : engageLockedPlaceholder}
          disabled={!canEngage || isPending}
          value={value}
          onChange={(event) => onChange(postId, event.target.value)}
        />

        <button
          type="button"
          onClick={() => onSubmit(postId)}
          disabled={!canEngage || !String(value || "").trim() || isPending}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
            !canEngage || !String(value || "").trim() || isPending
              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
              : "bg-primary text-black hover:bg-primary-hover"
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default FeedCommentComposer;