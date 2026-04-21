import { Link } from "react-router-dom";
import {
  Clock3,
  CheckCircle2,
  PauseCircle,
  XCircle,
  CalendarDays,
  HandHeart,
  Target,
  MapPin,
  Layers3,
  Eye,
  FileText,
} from "lucide-react";

import {
  formatProjectDate,
  getProjectFundingStats,
  getProjectMode,
  getProjectVolunteerStats,
} from "@/features/project/utils/projectDisplay.utils";
import {
  STATUS_LABELS,
  formatWorkspaceMoney,
  getWorkspaceProjectCoverUrl,
  getWorkspaceTypeLabel,
} from "./utils/workspaceProject.utils";

const STATUS_ICONS = {
  DRAFT: Clock3,
  PENDING_APPROVAL: Clock3,
  ACTIVE: CheckCircle2,
  UPDATING: PauseCircle,
  PAUSED: PauseCircle,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

export function WorkspaceProjectCard({ project }) {
  const status = String(project?.status || "DRAFT");
  const StatusIcon = STATUS_ICONS[status] || Clock3;
  const coverUrl = getWorkspaceProjectCoverUrl(project);

  const { currentAmount, targetAmount, fundingPercent } =
    getProjectFundingStats(project);
  const { currentVolunteers, targetVolunteers } =
    getProjectVolunteerStats(project);
  const { needsVolunteers } = getProjectMode(project);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="grid gap-4 sm:grid-cols-[108px_minmax(0,1fr)] sm:gap-5">
        <div className="relative mx-auto w-full max-w-[120px] shrink-0 sm:mx-0 sm:w-[108px]">
          <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={project?.title || "Ảnh dự án"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Dự án
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                  <StatusIcon size={14} />
                  <span className="truncate">{STATUS_LABELS[status] || status}</span>
                </span>

                <span className="inline-flex max-w-[200px] items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  <Layers3 size={13} className="shrink-0" />
                  <span className="truncate">{getWorkspaceTypeLabel(project?.projectType)}</span>
                </span>

                <span className="inline-flex max-w-[180px] rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  <span className="truncate">{project?.category || "Chưa phân loại"}</span>
                </span>
              </div>

              <p className="break-all text-lg font-bold text-slate-900">{project.title}</p>

              <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <CalendarDays size={14} className="shrink-0" />
                  <span className="truncate">
                    {formatProjectDate(project?.startDate)} - {formatProjectDate(project?.endDate)}
                  </span>
                </span>

                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">{project?.location?.address || "Chưa cập nhật địa điểm"}</span>
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                to={`/projects/${project._id}`}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Eye size={14} />
                Chi tiết
              </Link>

              {project.status === "DRAFT" ? (
                <Link
                  to={`/projects/create/${project._id}/edit`}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  <FileText size={14} />
                  Chỉnh sửa
                </Link>
              ) : null}

              {project.status === "UPDATING" ? (
                <Link
                  to={`/projects/${project._id}/updating`}
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-amber-600"
                >
                  <FileText size={14} />
                  Cập nhật milestone
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-stretch">
        <div className="min-w-0 flex-1 rounded-xl border border-amber-200 bg-amber-50/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">
            Gây quỹ
          </p>
          <p className="mt-1 break-words text-sm font-bold text-slate-900">
            {formatWorkspaceMoney(currentAmount)} / {formatWorkspaceMoney(targetAmount)}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#F59E0B_0%,#D97706_100%)]"
              style={{ width: `${fundingPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs font-semibold text-amber-700">
            {fundingPercent}% đạt mục tiêu
          </p>
        </div>

        <div className="min-w-0 flex-1 rounded-xl border border-sky-200 bg-sky-50/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">
            Tình nguyện viên
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <HandHeart size={14} className="shrink-0 text-sky-700" />
            {currentVolunteers}/{targetVolunteers}
          </p>
          <p className="mt-1 break-words text-xs text-sky-700">
            {needsVolunteers ? "Đang tuyển tình nguyện viên" : "Không tuyển tình nguyện viên"}
          </p>
        </div>

        <div className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
            Mục tiêu dự án
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Target size={14} className="shrink-0 text-emerald-700" />
            <span className="break-words">
              {project?.projectType === "VOLUNTEER_ONLY"
                ? "Tác động từ tình nguyện viên"
                : "Tác động từ gây quỹ"}
            </span>
          </p>
          <p className="mt-1 break-words text-xs text-emerald-700">
            Tạo ngày {formatProjectDate(project?.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceProjectCard;
