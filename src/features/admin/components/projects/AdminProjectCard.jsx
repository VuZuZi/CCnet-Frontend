import {
  Calendar,
  Users,
  Wallet,
  Eye,
  Clock,
  Trash2,
  Loader2,
  CheckCircle2,
  History,
  Mail,
  ArrowRight,
} from "lucide-react";

import {
  getAdminUIStatusLabel,
  getAdminUIStatusStyle,
  getProjectTypeLabel,
  mapProjectStatusToUI,
  normalizeProjectStatus,
} from "../../utils/projectStatus.utils";
import {
  buildProjectStatusOptions,
  getPrimaryProjectAction,
} from "../../utils/projectAction.utils";
import { stripHtml } from "../../utils/projectFilter.utils";
import {
  formatDate,
  formatVnd,
  resolveFundingSummary,
  resolveProjectCoverUrl,
  resolveProjectDocumentsCount,
  resolveProjectOrganizer,
  resolveProjectTimelineState,
  resolveVolunteerSummary,
} from "../../utils/adminProjectDisplay.utils";

const getProgressWidth = (value) =>
  `${Math.max(0, Math.min(100, value || 0))}%`;

const getCardTone = (uiStatus) => {
  switch (uiStatus) {
    case "ACTIVE":
      return {
        card: "bg-emerald-50/40 border-emerald-100",
        header: "bg-emerald-50/55 border-emerald-100",
        section: "bg-white/90",
        timeline: "bg-emerald-50/45 border-emerald-100",
      };

    case "PENDING_APPROVAL":
      return {
        card: "bg-amber-50/45 border-amber-100",
        header: "bg-amber-50/55 border-amber-100",
        section: "bg-white/92",
        timeline: "bg-amber-50/45 border-amber-100",
      };

    case "PAUSED":
      return {
        card: "bg-orange-50/45 border-orange-100",
        header: "bg-orange-50/55 border-orange-100",
        section: "bg-white/92",
        timeline: "bg-orange-50/40 border-orange-100",
      };

    case "COMPLETED":
      return {
        card: "bg-blue-50/45 border-blue-100",
        header: "bg-blue-50/55 border-blue-100",
        section: "bg-white/92",
        timeline: "bg-blue-50/40 border-blue-100",
      };

    case "CANCELLED":
      return {
        card: "bg-rose-50/45 border-rose-100",
        header: "bg-rose-50/55 border-rose-100",
        section: "bg-white/92",
        timeline: "bg-rose-50/40 border-rose-100",
      };

    default:
      return {
        card: "bg-white border-slate-200",
        header: "bg-slate-50/70 border-slate-200",
        section: "bg-white",
        timeline: "bg-slate-50 border-slate-200",
      };
  }
};

export default function AdminProjectCard({
  project,
  pendingProjectId,
  pendingDeleteProjectId,
  onRequestProjectAction,
  onApprove,
  onOpenHistory,
  onDelete,
  onOpenDetail,
}) {
  const realStatus = normalizeProjectStatus(project?.status);
  const uiStatus = mapProjectStatusToUI(realStatus);
  const statusStyle = getAdminUIStatusStyle(uiStatus);
  const tone = getCardTone(uiStatus);
  const statusOptions = buildProjectStatusOptions(project);
  const primaryAction = getPrimaryProjectAction(project);

  const {
    currentAmount,
    targetAmount,
    isFundraising,
    fundsPercent,
  } = resolveFundingSummary(project);

  const {
    rolesCount,
    currentVolunteers,
    targetVolunteers,
    hasVolunteerTarget,
    volunteerPercent,
  } = resolveVolunteerSummary(project);

  const { daysRemaining, isExpired, showExpiredBadge } =
    resolveProjectTimelineState(project, uiStatus);

  const descriptionText =
    stripHtml(project?.description) || "No description available.";
  const coverUrl = resolveProjectCoverUrl(project);
  const documentsCount = resolveProjectDocumentsCount(project);
  const organizer = resolveProjectOrganizer(project);

  const isUpdatingThisProject = pendingProjectId === project._id;
  const isDeletingThisProject = pendingDeleteProjectId === project._id;
  const hasStatusOptions = statusOptions.length > 1;

  return (
    <div
      className={`group overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${tone.card}`}
    >
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
                onChange={(e) => {
                  const selectedStatus = e.target.value;
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
                  onClick={() => onDelete(project)}
                  disabled={isUpdatingThisProject || isDeletingThisProject}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Delete project"
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

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className={`rounded-xl border border-slate-200 p-3 shadow-sm ${tone.section}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Wallet size={15} />
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  Funding
                </span>
              </div>

              <span className="text-xs font-semibold text-amber-700">
                {isFundraising ? `${fundsPercent}%` : "Volunteer only"}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-700"
                style={{ width: getProgressWidth(fundsPercent) }}
              />
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {formatVnd(currentAmount)} VND
              </p>
              <p className="text-xs text-slate-500">
                Target: {formatVnd(targetAmount)} VND
              </p>
            </div>
          </div>

          <div className={`rounded-xl border border-slate-200 p-3 shadow-sm ${tone.section}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Users size={15} />
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  Volunteers
                </span>
              </div>

              <span className="text-xs font-semibold text-emerald-700">
                {hasVolunteerTarget ? `${volunteerPercent}%` : "N/A"}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{ width: getProgressWidth(volunteerPercent) }}
              />
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {currentVolunteers.toLocaleString()} volunteers
              </p>
              <p className="text-xs text-slate-500">
                Target: {targetVolunteers.toLocaleString()}
              </p>
            </div>

            {rolesCount > 0 ? (
              <div className="mt-2 text-xs text-slate-500">Roles: {rolesCount}</div>
            ) : null}
          </div>
        </div>

        <div
          className={`flex flex-col gap-3 rounded-xl border px-3 py-3 md:flex-row md:items-center md:justify-between ${tone.timeline}`}
        >
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
            <div className="inline-flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400" />
              <span>Start: {formatDate(project?.startDate)}</span>
            </div>

            <div className="inline-flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400" />
              <span>End: {formatDate(project?.endDate)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {daysRemaining !== null && !isExpired && daysRemaining > 0 ? (
              <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {daysRemaining} days remaining
              </div>
            ) : null}

            {showExpiredBadge ? (
              <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                Project expired
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onOpenDetail(project)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
          >
            <Eye size={15} />
            View project details
          </button>

          <button
            type="button"
            onClick={() => onOpenHistory(project)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-500 bg-amber-500 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 hover:border-amber-600"
          >
            <History size={15} />
            View history
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}