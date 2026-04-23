import { Filter, Search } from "lucide-react";

export function OrganizerRequestFilters({ filters, setFilters }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row xl:max-w-[760px]">
          <div className="relative w-full min-w-0 md:max-w-[320px]">
            <Filter
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                  page: 1,
                }))
              }
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="DECLINED">Từ chối</option>
            </select>
          </div>

          <div className="relative w-full min-w-0">
            <Search
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
              placeholder="Tìm kiếm theo tên, email hoặc tổ chức..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerRequestFilters;
