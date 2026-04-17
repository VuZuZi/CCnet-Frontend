import { Link } from 'react-router-dom';
import { AlertTriangle, FilterX, Layers, Plus, Search } from 'lucide-react';
import { CATEGORY_OPTIONS, URGENCY_OPTIONS } from '../hooks/useHelpRequestFilters';

export function HelpRequestFilterBar({
  localSearch,
  setLocalSearch,
  filters,
  onFilterChange,
  hasActiveFilters,
  onResetFilters,
  onCreateClick,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Dùng bộ lọc để nhanh chóng tìm các yêu cầu phù hợp nhất với bạn.
        </p>

        <Link
          to="/need-help/create"
          onClick={onCreateClick}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-900 shadow-sm shadow-amber-500/20 transition-colors hover:bg-amber-500"
        >
          <Plus size={16} />
          Tạo yêu cầu
        </Link>
      </div>

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1.8fr)_repeat(2,minmax(0,0.8fr))_auto]">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm tiêu đề, câu chuyện, địa điểm"
            className="block h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Layers size={16} className="text-slate-400" />
          </div>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="block h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-900 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
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
            <AlertTriangle size={16} className="text-slate-400" />
          </div>
          <select
            value={filters.urgencyLevel}
            onChange={(e) => onFilterChange('urgencyLevel', e.target.value)}
            className="block h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-900 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          >
            {URGENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <FilterX size={16} />
            Đặt lại
          </button>
        )}
      </div>
    </div>
  );
}
