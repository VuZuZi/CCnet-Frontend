import { ChevronLeft, ChevronRight } from "lucide-react";

function ProjectManagementPagination({
  startItem,
  endItem,
  totalItems,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-800">{startItem}</span>
        {" – "}
        <span className="font-semibold text-slate-800">{endItem}</span>
        {" "}of{" "}
        <span className="font-semibold text-slate-800">{totalItems}</span>{" "}
        projects
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage <= 1}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
          {currentPage} / {totalPages}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default ProjectManagementPagination;