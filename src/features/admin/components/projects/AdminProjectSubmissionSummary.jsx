import { Eye } from "lucide-react";

export default function AdminProjectSubmissionSummary({
  project,
  revisionCount,
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#F59E0B]">
          <Eye size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Tóm tắt hồ sơ dự án
          </h3>
          <p className="text-sm text-slate-500">Tóm tắt nhanh cho quản trị viên</p>
        </div>
      </div>

      <div className="space-y-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Dự án
          </p>
          <p className="mt-1 font-semibold text-slate-900">{project.title}</p>
          <p className="mt-1 inline-flex items-center rounded bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">
            {project.projectType}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Lịch sử sửa đổi
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            Đã sửa: {revisionCount}/2 lần
          </p>
          {revisionCount > 0 ? (
            <p className="mt-1 text-xs font-medium text-orange-500">
              Cẩn thận: Đã bị Từ chối để sửa chữa trước đó.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Người tổ chức
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {project.organizerId?.fullName || "Không có"}
          </p>
          <p className="text-xs text-slate-500">
            {project.organizerId?.email || ""}
          </p>
        </div>
      </div>
    </div>
  );
}
