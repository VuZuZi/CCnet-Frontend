import { Link } from "react-router-dom";
import { AlertTriangle, FilterX, Layers, Map, Plus, Search } from "lucide-react";
import { CATEGORY_OPTIONS, URGENCY_OPTIONS } from "../hooks/useHelpRequestFilters";

export function HelpRequestFilterBar({
  localSearch,
  setLocalSearch,
  filters,
  onFilterChange,
  hasActiveFilters,
  onResetFilters,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Bộ lọc
          </div>

          <p className="mt-2 text-[13px] leading-6 text-slate-500">
            Thu hẹp danh sách để thấy đúng những yêu cầu phù hợp nhất với khả năng hỗ trợ của bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/need-help/map"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 text-[13px] font-bold text-slate-900 shadow-sm transition-colors hover:bg-amber-100"
          >
            <Map size={15} />
            Xem bản đồ
          </Link>

          <Link
            to="/need-help/create"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-amber-400 px-3.5 text-[13px] font-bold text-slate-900 shadow-sm shadow-amber-500/20 transition-colors hover:bg-amber-500"
          >
            <Plus size={15} />
            Tạo yêu cầu
          </Link>
        </div>
      </div>

      <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.55fr)_repeat(2,minmax(0,0.82fr))_auto]">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={15} className="text-slate-400" />
          </div>

          <input
            type="text"
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
            placeholder="Tìm tiêu đề, câu chuyện, địa điểm"
            className="block h-9 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[13px] text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Layers size={15} className="text-slate-400" />
          </div>

          <select
            value={filters.category}
            onChange={(event) => onFilterChange("category", event.target.value)}
            className="block h-9 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-[13px] text-slate-900 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <AlertTriangle size={15} className="text-slate-400" />
          </div>

          <select
            value={filters.urgencyLevel}
            onChange={(event) =>
              onFilterChange("urgencyLevel", event.target.value)
            }
            className="block h-9 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-[13px] text-slate-900 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          >
            {URGENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters ? (
          <div className="flex items-center">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 xl:w-auto"
            >
              <FilterX size={15} />
              Đặt lại
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default HelpRequestFilterBar;