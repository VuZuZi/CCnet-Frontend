import React from "react";
import { BadgeCheck, BellRing, Edit2, Plus } from "lucide-react";
import { useFollowMutations } from "@/features/community/hooks/useFollow";

export function ProjectHeader({ project, isOrganizer }) {
  const { toggleProjectFollow } = useFollowMutations();

  return (
    <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4 min-w-0">
        <h1 className="min-w-0 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl break-words [overflow-wrap:anywhere]">
          {project?.title || "Đang cập nhật tên dự án..."}
        </h1>

        {isOrganizer && (
          <button className="flex-shrink-0 rounded-2xl border border-[#FBBF24]/20 bg-[#FFFBEB] p-3 transition-colors hover:bg-[#FFF7D6]">
            <Edit2 className="h-5 w-5 text-[#B45309]" />
          </button>
        )}
      </div>

      {!isOrganizer && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <div className="flex items-center gap-4">
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

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-gray-900">
                  {project?.organizerId?.fullName || "Tổ chức ẩn danh"}
                </h3>
                {project?.organizerId?.isVerified && (
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-500">Đơn vị tổ chức</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleProjectFollow.mutate(project?._id)}
            disabled={toggleProjectFollow.isPending || !project?._id}
            className={`hidden items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors sm:flex ${project?.isFollowing
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
              {Math.max(0, project?.stats?.followerCount || 0)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectHeader;
