import {
  CheckCircle2,
  History,
  Loader2,
  Mail,
  Trash2,
  Users,
} from "lucide-react";

import {
  getAdminUIStatusLabel,
  getAdminUIStatusStyle,
  getProjectTypeLabel,
} from "../../utils/projectStatus.utils";

export default function AdminProjectCardHeader({
  project,
  tone,
  uiStatus,
  realStatus,
  statusOptions,
  primaryAction,
  organizer,
  coverUrl,
  documentsCount,
  descriptionText,
  isUpdatingThisProject,
  isDeletingThisProject,
  hasStatusOptions,
  canDelete,
  onRequestProjectAction,
  onApprove,
  onOpenHistory,
  onDelete,
}) {
  const statusStyle = getAdminUIStatusStyle(uiStatus);

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
                  Documents: {documentsCount}
                </span>
              ) : null}
            </div>

            <div className="flex items-start gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Project cover"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-base">
                    📁
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
                    <span>{organizer?.fullName || "N/A"}</span>
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

          <div className="flex w-full shrink-0 flex-col gap-2.5 xl:w-[240px]">
            <select
              value={realStatus}
              onChange={(event) => {
                const selectedStatus = event.target.value;
                if (selectedStatus !== realStatus) {
                  onRequestProjectAction(project, selectedStatus);
                }
              }}
              disabled={
                isUpdatingThisProject ||
                isDeletingThisProject ||
                !hasStatusOptions
              }
              className="h-10 w-full rounded-xl border border-amber-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition hover:border-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-2">
              {primaryAction ? (
                <button
                  type="button"
                  onClick={() => onApprove(project)}
                  disabled={isUpdatingThisProject || isDeletingThisProject}
                  className={`${primaryAction.className} h-10 flex-1 rounded-xl shadow-sm`}
                  title={primaryAction.title}
                >
                  {isUpdatingThisProject ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {primaryAction.label}
                    </>
                  )}
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => onOpenHistory(project)}
                disabled={isUpdatingThisProject || isDeletingThisProject}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="View history"
              >
                <History size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (canDelete) {
                    onDelete(project);
                  }
                }}
                disabled={
                  isUpdatingThisProject ||
                  isDeletingThisProject ||
                  !canDelete
                }
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition ${
                  canDelete
                    ? "border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                } disabled:opacity-50`}
                title={
                  canDelete
                    ? "Delete project"
                    : "Không thể xóa project ở trạng thái này"
                }
              >
                {isDeletingThisProject ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}