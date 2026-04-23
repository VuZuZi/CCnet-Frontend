import { Filter, Search } from "lucide-react";
import { ACTION_OPTIONS } from "../../utils/adminActionLog.utils";

function ActionLogsFilters({
  actionFilter,
  onActionFilterChange,
  searchInput,
  onSearchChange,
}) {
  return (
    <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row xl:max-w-[760px]">
          <div className="relative w-full min-w-0 md:max-w-[320px]">
            <Filter
              size={15}
              strokeWidth={2.3}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={actionFilter}
              onChange={(event) => onActionFilterChange(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full min-w-0">
            <Search
              size={15}
              strokeWidth={2.3}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm kiếm theo quản trị viên, người dùng mục tiêu, email, lý do..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActionLogsFilters;
