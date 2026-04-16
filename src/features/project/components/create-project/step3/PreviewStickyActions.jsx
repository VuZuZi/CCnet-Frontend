import { ArrowLeft, Loader2, Send } from "lucide-react";

export function PreviewStickyActions({
  isPending,
  isReady,
  onBack,
  onSubmit,
}) {
  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
        >
          <ArrowLeft size={18} />
          Quay lại chỉnh sửa
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending || !isReady}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 font-bold shadow-sm transition-all sm:w-auto ${
            isPending || !isReady
              ? "cursor-not-allowed bg-slate-400 text-white"
              : "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
          }`}
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : null}
          {isPending ? "Submitting..." : "Gửi dự án để duyệt"}
          {!isPending ? <Send size={18} /> : null}
        </button>
      </div>
    </div>
  );
}

export default PreviewStickyActions;