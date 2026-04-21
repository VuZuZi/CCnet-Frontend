import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CircleDollarSign, MapPin, Users } from "lucide-react";

import {
  getProjectCategoryLabel,
  getProjectCategoryStyles,
} from "../../utils/projectDisplay.utils";

function ProjectMapProjectCardComponent({
  project,
  isActive = false,
  onClick,
}) {
  if (!project) return null;

  const hasFunding = Number(project?.targetAmount || 0) > 0;
  const hasVolunteers =
    Boolean(project?.needsVolunteers) ||
    Number(project?.targetVolunteers || 0) > 0;

  const coverImage =
    project?.coverImage ||
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="px-3 py-2">
      <button
        type="button"
        onClick={() => onClick?.(project)}
        className={`w-full min-w-0 overflow-hidden rounded-[28px] border p-4 text-left transition-all ${
          isActive
            ? "border-amber-300 bg-amber-50 shadow-[0_16px_36px_rgba(251,191,36,0.18)] ring-2 ring-amber-200/70"
            : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
        }`}
      >
        <div className="flex items-start gap-4">
          <img
            src={coverImage}
            alt={project?.title || "Project cover"}
            className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover"
            loading="lazy"
          />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex min-w-0 items-start justify-between gap-3">
              <span
                className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[11px] font-bold ${getProjectCategoryStyles(
                  project?.category
                )}`}
              >
                <span className="truncate">
                  {getProjectCategoryLabel(project?.category)}
                </span>
              </span>

              {project?.isUrgent ? (
                <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
                  Khẩn cấp
                </span>
              ) : null}
            </div>

            <h3 className="line-clamp-2 min-w-0 break-words text-base font-black tracking-tight text-slate-900">
              {project?.title || "Dự án cộng đồng"}
            </h3>

            <div className="mt-2 flex min-w-0 items-start gap-1.5 text-xs text-slate-500">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span className="line-clamp-2 min-w-0 break-words">
                {project?.address || "Chưa có địa điểm cụ thể"}
              </span>
            </div>

            <p className="mt-2 line-clamp-2 min-w-0 break-all text-xs text-slate-500">
              {project?.summary || "Dự án đang chờ bạn khám phá thêm chi tiết."}
            </p>
          </div>
        </div>

        <div
          className={`mt-4 grid gap-2 ${
            hasFunding && hasVolunteers ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {hasFunding ? (
            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <CircleDollarSign size={13} />
                Gây quỹ
              </div>
              <div className="mt-1 text-base font-black text-slate-900">
                {Number(project?.fundingPercent || 0)}%
              </div>
              <div className="text-[11px] text-slate-500">
                {Number(project?.currentAmount || 0).toLocaleString("vi-VN")} /{" "}
                {Number(project?.targetAmount || 0).toLocaleString("vi-VN")} đ
              </div>
            </div>
          ) : null}

          {hasVolunteers ? (
            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Users size={13} />
                Tình nguyện
              </div>
              <div className="mt-1 text-base font-black text-slate-900">
                {Number(project?.volunteerPercent || 0)}%
              </div>
              <div className="text-[11px] text-slate-500">
                {Number(project?.currentVolunteers || 0)} /{" "}
                {Number(project?.targetVolunteers || 0)} TNV
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 flex-1 break-words text-xs font-medium text-slate-500">
            Bấm để xem trên bản đồ
          </span>

          <Link
            to={`/projects/${project?.projectId}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FBBF24] px-4 py-2 text-xs font-black text-slate-900 transition-colors hover:bg-[#F59E0B]"
          >
            Chi tiết
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </button>
    </div>
  );
}

const ProjectMapProjectCard = memo(
  ProjectMapProjectCardComponent,
  (prevProps, nextProps) =>
    prevProps.project === nextProps.project &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.onClick === nextProps.onClick
);

export default ProjectMapProjectCard;