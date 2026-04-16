import { Filter, Search } from "lucide-react";

import WorkspaceProjectCard from "./WorkspaceProjectCard";
import WorkspacePagination from "./WorkspacePagination";
import {
  PAGE_SIZE,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
} from "./utils/workspaceProject.utils";

export function WorkspaceProjectSection({
  filteredProjects,
  paginatedProjects,
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
  projectType,
  onProjectTypeChange,
  volunteerMode,
  onVolunteerModeChange,
  activeCurrentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Danh sách dự án của bạn</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
            {filteredProjects.length} dự án
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            Trang {activeCurrentPage}/{totalPages}
          </span>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-slate-900">
          <Filter size={18} />
          <h3 className="text-sm font-bold uppercase tracking-[0.08em]">Bộ lọc</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
            />
            <input
              value={keyword}
              onChange={onKeywordChange}
              placeholder="Tìm theo tên, category, địa chỉ..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
          </label>

          <select
            value={status}
            onChange={onStatusChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={projectType}
            onChange={onProjectTypeChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={volunteerMode}
            onChange={onVolunteerModeChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          >
            <option value="ALL">Tất cả nhu cầu volunteer</option>
            <option value="NEEDS">Cần volunteer</option>
            <option value="NO_NEEDS">Không cần volunteer</option>
          </select>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-semibold text-slate-700">Không có dự án phù hợp bộ lọc.</p>
          <p className="mt-2 text-sm text-slate-500">
            Bạn có thể đổi bộ lọc hoặc tạo dự án mới.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedProjects.map((project) => (
            <WorkspaceProjectCard key={project._id} project={project} />
          ))}

          <WorkspacePagination
            currentPage={activeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredProjects.length}
            pageSize={PAGE_SIZE}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}

export default WorkspaceProjectSection;