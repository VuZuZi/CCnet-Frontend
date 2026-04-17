import { ChevronLeft, ChevronRight } from "lucide-react";

export function SupportedProjectsPagination({ pagination, onPrev, onNext }) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Trang {pagination.page} / {pagination.totalPages} · {pagination.total} kết
        quả
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Trước
        </button>

        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] px-4 py-2.5 text-sm font-bold text-slate-900 shadow-[0_10px_20px_rgba(255,193,7,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sau
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default SupportedProjectsPagination;