import { ArrowRight, Loader2, Save } from "lucide-react";

export function Step1StickyActions({
  isPending,
  onSaveDraft,
}) {
  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
        >
          <Save size={18} />
          Save Draft & Exit
        </button>

        <button
          type="submit"
          disabled={isPending}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 font-bold shadow-sm transition-all sm:w-auto ${
            isPending
              ? "cursor-not-allowed bg-slate-400 text-white"
              : "bg-primary text-white shadow-lg shadow-yellow-500/20 hover:bg-primary-hover"
          }`}
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : null}
          {isPending ? "Processing..." : "Next: Budget & Personnel"}
          {!isPending ? <ArrowRight size={20} /> : null}
        </button>
      </div>
    </div>
  );
}

export default Step1StickyActions;