import { ArrowLeft, Loader2, Send, Trash2 } from "lucide-react";

export function PreviewStickyActions({
  isPending,
  isReady,
  onBack,
  onSubmit,
  onDiscard,
}) {
  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        
        <div className="flex w-full gap-3 sm:w-auto">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 px-4 py-3 font-bold text-red-600 shadow-sm transition-colors hover:bg-red-100 disabled:opacity-50"
            title="Hủy bản nháp"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Hủy</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 sm:flex-none sm:w-auto"
          >
            <ArrowLeft size={18} />
            Quay lại chỉnh sửa
          </button>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending || !isReady}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 font-bold shadow-sm transition-all sm:w-auto ${
            isPending || !isReady
              ? "cursor-not-allowed bg-slate-400 text-white"
              : "bg-[#fbbf24] text-slate-900 shadow-lg shadow-yellow-500/20 hover:bg-[#f59e0b]"
          }`}
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : null}
          {isPending ? "Đang gửi..." : "Gửi dự án để duyệt"}
          {!isPending ? <Send size={18} /> : null}
        </button>
      </div>
    </div>
  );
}

export default PreviewStickyActions;