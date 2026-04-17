import { ArrowRight, Eye, History } from "lucide-react";

export default function AdminProjectCardFooterActions({
  project,
  onOpenDetail,
  onOpenHistory,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onOpenDetail(project)}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
      >
        <Eye size={15} />
        View project details
      </button>

      <button
        type="button"
        onClick={() => onOpenHistory(project)}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-500 bg-amber-500 px-4 text-sm font-bold text-white shadow-sm transition hover:border-amber-600 hover:bg-amber-600"
      >
        <History size={15} />
        View history
        <ArrowRight size={14} />
      </button>
    </div>
  );
}