import React from "react";
import { BadgeCheck, BellRing, Edit2, Plus, CalendarDays, Users, Heart } from "lucide-react";
import { useFollowMutations } from "@/features/community/hooks/useFollow";

function formatDate(dateValue) {
  if (!dateValue) return "Đang cập nhật";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleDateString("vi-VN");
}

export function ProjectHeader({ project, isOrganizer }) {
  const { toggleProjectFollow } = useFollowMutations();
  const followerCount = Math.max(0, Number(project?.stats?.followerCount || 0));
  const volunteerCount = Math.max(0, Number(project?.stats?.currentVolunteers || 0));

  return (
    <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4 min-w-0">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">
            Project Overview
          </div>
          <h1 className="min-w-0 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl break-words [overflow-wrap:anywhere]">
          {project?.title || "Đang cập nhật tên dự án..."}
          </h1>
        </div>

        {isOrganizer && (
          <button className="flex-shrink-0 rounded-2xl border border-[#FBBF24]/20 bg-[#FFFBEB] p-3 transition-colors hover:bg-[#FFF7D6]">
            <Edit2 className="h-5 w-5 text-[#B45309]" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Timeline</p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {formatDate(project?.startDate)} - {formatDate(project?.endDate)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Followers</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-800">
            <Heart className="h-4 w-4 text-rose-500" />
            {followerCount.toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Volunteers</p>
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
                  alt="Organizer"
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
                  {volunteerCount.toLocaleString("vi-VN")} volunteer
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleProjectFollow.mutate(project?._id)}
            disabled={toggleProjectFollow.isPending || !project?._id}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${project?.isFollowing
              ? "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
              : "border-slate-200 bg-white text-gray-700 hover:bg-slate-50"
              } ${toggleProjectFollow.isPending ? "cursor-not-allowed opacity-70" : ""}`}
          >
            {project?.isFollowing ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            {project?.isFollowing ? "Đang theo dõi" : "Theo dõi dự án"}

            <span className="ml-1 rounded-full bg-black/5 px-2 py-0.5 text-[11px]">
              {followerCount}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectHeader;
