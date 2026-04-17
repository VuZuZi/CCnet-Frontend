import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { FALLBACK_COVER } from "../../constants/supportedProjects.constants";
import {
  formatDate,
  getStatusMeta,
} from "../../utils/supportedProjects.utils";

export function SupportedProjectCard({ item }) {
  const project = item.project;
  const statusMeta = getStatusMeta(item);
  const StatusIcon = statusMeta.icon;

  if (!project) return null;

  return (
    <article
      className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
      style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}
    >
      <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="relative min-h-[230px] overflow-hidden bg-slate-100">
          <img
            src={project.coverMedia?.url || FALLBACK_COVER}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
              {project.category || "Dự án"}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm ${statusMeta.className}`}
            >
              <StatusIcon size={12} />
              {statusMeta.label}
            </div>

            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {project.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                {project.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {project.organizer?.fullName
                  ? `Organizer: ${project.organizer.fullName}`
                  : "Chưa có thông tin organizer."}
              </p>
            </div>

            <Link
              to={`/projects/${project.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] px-4 py-2.5 text-sm font-black text-slate-900 shadow-[0_12px_24px_rgba(255,193,7,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(255,179,0,0.30)]"
            >
              Mở dự án
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition group-hover:border-amber-100 group-hover:bg-amber-50/40">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Trạng thái đơn
              </p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {item.applicationStatus}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition group-hover:border-amber-100 group-hover:bg-amber-50/40">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Ngày nộp đơn
              </p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {formatDate(item.appliedAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition group-hover:border-amber-100 group-hover:bg-amber-50/40">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Địa điểm
              </p>
              <p className="mt-2 line-clamp-1 text-sm font-bold text-slate-800">
                {project.location?.address || "Chưa cập nhật"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition group-hover:border-amber-100 group-hover:bg-amber-50/40">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Thời gian
              </p>
              <p className="mt-2 line-clamp-1 text-sm font-bold text-slate-800">
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </p>
            </div>
          </div>

          {item.rejectReason ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <strong>Lý do từ chối:</strong> {item.rejectReason}
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
              <MapPin size={12} />
              {project.location?.address || "Chưa có địa điểm"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
              <CalendarDays size={12} />
              {item.derivedStatus}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default SupportedProjectCard;