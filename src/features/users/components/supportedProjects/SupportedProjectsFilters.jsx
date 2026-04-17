import { Search } from "lucide-react";
import { FILTERS } from "../../constants/supportedProjects.constants";

export function SupportedProjectsFilters({
  view,
  search,
  onViewChange,
  onSearchChange,
}) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Lịch sử tham gia dự án
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Lọc theo trạng thái hoặc tìm kiếm theo tên dự án, danh mục và địa
            điểm.
          </p>
        </div>

        <label className="relative block w-full max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm dự án đã tham gia"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((filterItem) => {
          const active = view === filterItem.value;

          return (
            <button
              key={filterItem.value}
              type="button"
              onClick={() => onViewChange(filterItem.value)}
              className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                active
                  ? "bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] text-slate-900 shadow-[0_10px_20px_rgba(255,193,7,0.20)]"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              {filterItem.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default SupportedProjectsFilters;