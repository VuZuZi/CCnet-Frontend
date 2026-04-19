import { memo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, CircleDollarSign, ArrowUpRight } from "lucide-react";

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

  return (
    <div className="px-3 py-2">
      <button
        type="button"
        onClick={() => onClick?.(project)}
        className={`w-full rounded-[28px] border p-4 text-left transition-all ${
          isActive
            ? "border-amber-300 bg-amber-50 shadow-[0_12px_30px_rgba(251,191,36,0.18)] ring-2 ring-amber-200/60"
            : "border-slate-200 bg-white shadow-sm hover:border-amber-200 hover:shadow-md"
        }`}
      >
        <div className="flex items-start gap-4">
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover"
            loading="lazy"
          />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between gap-3">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getProjectCategoryStyles(
                  project.category
                )}`}
              >
                {getProjectCategoryLabel(project.category)}
              </span>

              {project.isUrgent ? (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
                  Khẩn cấp
                </span>
              ) : null}
            </div>

            <h3 className="line-clamp-2 text-base font-black tracking-tight text-slate-900">
              {project.title}
            </h3>

            <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{project.address}</span>
            </div>

            <p className="mt-2 line-clamp-2 text-xs text-slate-500">
              {project.summary}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {hasFunding ? (
            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <CircleDollarSign size={13} />
                Gây quỹ
              </div>
              <div className="mt-1 text-base font-black text-slate-900">
                {project.fundingPercent}%
              </div>
              <div className="text-[11px] text-slate-500">
                {project.currentAmount.toLocaleString("vi-VN")} /{" "}
                {project.targetAmount.toLocaleString("vi-VN")} đ
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
                {project.volunteerPercent}%
              </div>
              <div className="text-[11px] text-slate-500">
                {project.currentVolunteers} / {project.targetVolunteers} TNV
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-500">
            Bấm để xem trên bản đồ
          </span>

          <Link
            to={`/projects/${project.projectId}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-full bg-[#fbbf24] px-4 py-2 text-xs font-black text-slate-900 transition-colors hover:bg-[#f59e0b]"
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
    prevProps.project?.projectId === nextProps.project?.projectId &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.onClick === nextProps.onClick
);

export default ProjectMapProjectCard;