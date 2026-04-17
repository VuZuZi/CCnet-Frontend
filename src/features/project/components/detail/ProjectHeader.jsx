import React from "react";
import { BadgeCheck, CalendarDays, Users } from "lucide-react";

function formatDate(dateValue) {
  if (!dateValue) return "Đang cập nhật";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleDateString("vi-VN");
}

export function ProjectHeader({ project, isOrganizer }) {
  const volunteerCount = Math.max(0, Number(project?.stats?.currentVolunteers || 0));

  return (
    <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4 min-w-0">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">
            Tổng quan dự án
          </div>
          <h1 className="min-w-0 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl break-words [overflow-wrap:anywhere]">
            {project?.title || "Đang cập nhật tên dự án..."}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Thời gian
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {formatDate(project?.startDate)} - {formatDate(project?.endDate)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Tình nguyện viên
          </p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-800">
            <Users className="h-4 w-4 text-emerald-600" />
            {volunteerCount.toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      {!isOrganizer && (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-green-200 bg-green-100 text-xl font-bold text-green-700">
              {project?.organizerId?.avatar ? (
                <img
                  src={project.organizerId.avatar}
                  alt="Ban tổ chức"
                  className="h-full w-full object-cover"
                />
              ) : (
                project?.organizerId?.fullName?.charAt(0) || "O"
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-lg font-bold text-gray-900">
                  {project?.organizerId?.fullName || "Tổ chức ẩn danh"}
                </h3>
                {project?.organizerId?.isVerified && (
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Bắt đầu {formatDate(project?.startDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {volunteerCount.toLocaleString("vi-VN")} tình nguyện viên
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectHeader;