import React from "react";
import { useFollowMutations } from "@/features/Community/hooks/useFollow";

export const ProjectHeader = ({ project, isOrganizer }) => {
  const { toggleProjectFollow } = useFollowMutations();

  return (
    <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
      </div>

      {!isOrganizer && (
        <button
          onClick={() => toggleProjectFollow.mutate(project._id)}
          disabled={toggleProjectFollow.isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all border ${
            project.isFollowing
              ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
              : "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {project.isFollowing ? "notifications_active" : "notifications"}
          </span>
          {project.isFollowing ? "Đang theo dõi" : "Theo dõi dự án"}
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/10 text-[10px]">
            {Math.max(0, project.stats?.followerCount || 0)}
          </span>
        </button>
      )}
    </div>
  );
};
