import { Search } from "lucide-react";
import { USER_FILTERS } from "../../utils/adminUser.utils";

export function UserFilters({
  activeFilter,
  onFilterChange,
  searchInput,
  onSearchChange,
}) {
  return (
    <div className="min-w-0 rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap gap-2">
          {USER_FILTERS.map((item) => {
            const isActive = activeFilter === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onFilterChange(item.key)}
                className={`min-w-0 rounded-2xl px-4 py-2 text-sm font-bold transition ${
                  isActive
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full min-w-0 xl:max-w-[320px]">
          <Search
            size={15}
            strokeWidth={2.3}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm kiếm theo tên, email, vai trò, ID..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
          />
        </div>
      </div>
    </div>
  );
}

export default UserFilters;
