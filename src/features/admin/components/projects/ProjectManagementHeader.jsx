import { Loader2, Search } from "lucide-react";
import { FILTER_CONFIG } from "../../utils/projectManagement.utils";
import AdminHistoryButton from "@/features/admin/components/AdminHistoryButton";

function ProjectManagementHeader({
  filterStatus,
  onFilterChange,
  searchText,
  onSearchChange,
  stats,
  isProjectsFetching,
  onOpenGlobalHistory,
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-[28px] font-black leading-none tracking-tight text-slate-900">
              Dự án
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Quản lý trạng thái dự án, các hành động kiểm duyệt, tiến độ và lịch sử trên toàn nền tảng.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[420px] xl:items-end">
            <div className="flex w-full flex-col gap-3 sm:flex-row xl:justify-end">
              <div className="relative flex-1 xl:min-w-[320px]">
                <Search
                  size={18}
                  strokeWidth={2.2}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchText}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Tìm kiếm theo tiêu đề, người tổ chức, email, hoặc ID..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                />
              </div>

              <AdminHistoryButton
                onClick={onOpenGlobalHistory}
                className="h-11 justify-center sm:min-w-[220px]"
              >
                Xem tất cả nhật ký dự án
              </AdminHistoryButton>
            </div>

            {isProjectsFetching ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                <Loader2 size={14} className="animate-spin" />
                Đang làm mới dữ liệu...
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {FILTER_CONFIG.map((filter) => {
            const count =
              filter.key === "ALL" ? stats.total : stats[filter.key] || 0;

            const isActive = filterStatus === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => onFilterChange(filter.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive ? filter.activeClassName : filter.idleClassName
                }`}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProjectManagementHeader;