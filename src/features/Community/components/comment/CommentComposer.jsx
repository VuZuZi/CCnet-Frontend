import { SendHorizonal } from "lucide-react";

export default function CommentComposer({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
  placeholder = "Viết bình luận...",
}) {
  const trimmedValue = value.trim();

  return (
    <form onSubmit={onSubmit} className="flex w-full items-end gap-2">
      <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-amber-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={1}
          disabled={isSubmitting}
          className="max-h-28 min-h-6 w-full resize-none border-none bg-transparent text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-70"
        />
      </div>

      <button
        type="submit"
        disabled={!trimmedValue || isSubmitting}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-sm shadow-amber-300/40 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        aria-label="Gửi bình luận"
      >
        <SendHorizonal size={18} />
      </button>
    </form>
  );
}
