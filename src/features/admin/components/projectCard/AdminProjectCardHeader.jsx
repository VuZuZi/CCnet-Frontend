import { History, Mail, Users } from "lucide-react";

import {
  getAdminUIStatusLabel,
  getAdminUIStatusStyle,
  getProjectTypeLabel,
  isReviewableProjectStatus,
} from "../../utils/projectStatus.utils";

export default function AdminProjectCardHeader({
  project,
  tone,
  uiStatus,
  organizer,
  coverUrl,
  documentsCount,
  descriptionText,
  isUpdatingThisProject,
  onOpenHistory,
}) {
  const statusStyle = getAdminUIStatusStyle(uiStatus);
  const reviewStage = isReviewableProjectStatus(project?.status);

  return (
    <div className={`border-b ${tone.header}`}>
      <div className="p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                <span>{statusStyle.icon}</span>
                {getAdminUIStatusLabel(uiStatus)}
              </span>

              <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {getProjectTypeLabel(project?.projectType)}
              </span>

              {documentsCount > 0 ? (
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  Tài liệu: {documentsCount}
                </span>
              ) : null}
            </div>

            <div className="flex items-start gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Ảnh bìa dự án"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-base">
                    -
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-slate-900">
                  {project?.title}
                </h3>

                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600">
                  {descriptionText}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                    <Users size={14} className="text-slate-400" />
                    <span>{organizer?.fullName || "Không có"}</span>
                  </div>

                  {organizer?.email ? (
                    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                      <Mail size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{organizer.email}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col items-end gap-2.5 xl:w-[220px]">
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-right text-xs font-semibold leading-5 text-amber-800">
              {reviewStage
                ? "Mở cockpit kiểm duyệt để quyết định phê duyệt, yêu cầu chỉnh sửa hoặc từ chối."
                : "Dùng thao tác vòng đời để tạm dừng, yêu cầu cập nhật, tiếp tục, hoàn thành hoặc hủy dự án."}
            </p>
            <button
              type="button"
              onClick={() => onOpenHistory(project)}
              disabled={isUpdatingThisProject}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              title="Xem lịch sử"
            >
              <History size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
