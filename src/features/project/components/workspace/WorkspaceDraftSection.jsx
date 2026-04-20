import { Filter, Search } from "lucide-react";

import WorkspaceDraftCard from "./WorkspaceDraftCard";
import WorkspacePagination from "./WorkspacePagination";
import { TYPE_OPTIONS, DRAFT_PAGE_SIZE } from "./utils/workspaceProject.utils";

export function WorkspaceDraftSection({
  isDraftLoading,
  isDraftFetching,
  filteredDraftProjects,
  paginatedDraftProjects,
  draftKeyword,
  onDraftKeywordChange,
  draftType,
  onDraftTypeChange,
  activeDraftPage,
  draftTotalPages,
  onDraftPageChange,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Danh sách bản nháp</h2>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
          {isDraftLoading || isDraftFetching
            ? "Đang tải..."
            : `${filteredDraftProjects.length} bản nháp`}
        </span>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-slate-900">
          <Filter size={18} />
          <h3 className="text-sm font-bold uppercase tracking-[0.08em]">
            Bộ lọc bản nháp
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
            />
            <input
              value={draftKeyword}
              onChange={onDraftKeywordChange}
              placeholder="Tìm bản nháp theo tên, danh mục, địa chỉ..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
          </label>

          <select
            value={draftType}
            onChange={onDraftTypeChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isDraftLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
          Đang tải danh sách bản nháp...
        </div>
      ) : filteredDraftProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-700">Hiện chưa có bản nháp nào.</p>
          <p className="mt-2 text-sm text-slate-500">
            Bạn có thể tạo dự án mới và lưu lại để tiếp tục sau.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedDraftProjects.map((draft) => (
            <WorkspaceDraftCard key={draft._id} draft={draft} />
          ))}

          <WorkspacePagination
            currentPage={activeDraftPage}
            totalPages={draftTotalPages}
            totalItems={filteredDraftProjects.length}
            pageSize={DRAFT_PAGE_SIZE}
            onPageChange={onDraftPageChange}
          />
        </div>
      )}
    </section>
  );
}

export default WorkspaceDraftSection;