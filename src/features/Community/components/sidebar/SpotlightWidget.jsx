import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, BadgeCheck, Heart, Sparkles } from "lucide-react";
import { useFeaturedProject } from "@/features/project/hooks/useProjectQueries";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return "";
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getProjectImage(project) {
  if (project?.coverMedia?.url) return project.coverMedia.url;
  if (Array.isArray(project?.coverMedia) && project?.coverMedia[0]?.url) {
    return project.coverMedia[0].url;
  }
  return "/placeholder-project.jpg";
}

function getCategoryLabel(category) {
  const map = {
    Y_TE: "Y tế",
    GIAO_DUC: "Giáo dục",
    MOI_TRUONG: "Môi trường",
    THIEN_TAI: "Khẩn cấp",
    XAY_DUNG: "Xây dựng",
  };
  return map[category] || "Dự án";
}

function getFundingStats(project) {
  const targetAmount =
    safeNumber(project?.targetAmount) ||
    safeNumber(project?.stats?.targetAmount);

  const raisedAmount =
    safeNumber(project?.financialDetail?.availableBalance) ||
    safeNumber(project?.currentAmount) ||
    safeNumber(project?.stats?.raisedAmount) ||
    safeNumber(project?.stats?.currentAmount);

  const fundingProgress =
    safeNumber(project?.stats?.fundingProgress) ||
    (targetAmount > 0
      ? Math.min(Math.round((raisedAmount / targetAmount) * 100), 100)
      : 0);

  return {
    targetAmount,
    raisedAmount,
    fundingProgress,
  };
}

function formatCompactCurrencyVND(value) {
  const amount = safeNumber(value);

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(
      amount % 1_000_000_000 === 0 ? 0 : 1,
    )}Bđ`;
  }

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(
      amount % 1_000_000 === 0 ? 0 : 1,
    )}Mđ`;
  }

  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}Kđ`;
  }

  return `${amount}đ`;
}

function extractCurrentUserApplicationStatus(project) {
  const candidates = [
    project?.currentUserParticipation?.volunteerStatus,
    project?.currentUserParticipation?.status,
    project?.currentUserVolunteer?.status,
    project?.myVolunteerApplication?.status,
    project?.myApplication?.status,
    project?.applicationStatus,
    project?.volunteerStatus,
  ];

  const matched = candidates.find(
    (value) => value !== null && value !== undefined,
  );

  return String(matched || "")
    .trim()
    .toUpperCase();
}

const SpotlightWidget = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = normalizeId(
    currentUser?._id || currentUser?.id || currentUser?.userId,
  );

  const { data: featuredProject, isLoading } = useFeaturedProject();

  const project = useMemo(() => {
    if (!featuredProject) return null;
    if (Array.isArray(featuredProject)) return featuredProject[0] || null;
    if (featuredProject?.project) return featuredProject.project;
    return featuredProject;
  }, [featuredProject]);

  const handleOpenProject = () => {
    const projectId = normalizeId(project?._id || project?.id);
    if (!projectId) return;
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-red-50 p-4">
          <AlertTriangle size={18} className="text-red-600" />
          <span className="text-xs font-bold uppercase text-red-700">
            Cần hỗ trợ gấp
          </span>
        </div>

        <div className="p-5">
          <div className="mb-4 aspect-video w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="mb-3 h-5 w-16 animate-pulse rounded bg-slate-100" />
          <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="mb-4 h-1.5 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!project?._id) {
    return null;
  }

  const imageUrl = getProjectImage(project);
  const categoryLabel = getCategoryLabel(project?.category);
  const { raisedAmount, fundingProgress } = getFundingStats(project);

  const currentUserApplicationStatus =
    extractCurrentUserApplicationStatus(project);

  const hasJoinedProject =
    currentUserId &&
    (currentUserApplicationStatus === "APPROVED" ||
      currentUserApplicationStatus === "WITHDRAW_REQUESTED");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-red-50 p-4">
        <AlertTriangle size={18} className="text-red-600" />
        <span className="text-xs font-bold uppercase text-red-700">
          Cần hỗ trợ gấp
        </span>
      </div>

      <div className="p-5">
        <button
          type="button"
          onClick={handleOpenProject}
          className="w-full text-left"
        >
          <div
            className="mb-4 aspect-video w-full rounded-xl bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />

          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
              {categoryLabel}
            </span>

            {project?.isUrgent ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">
                <Sparkles size={10} />
                Nổi bật
              </span>
            ) : null}

            {hasJoinedProject ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                <BadgeCheck size={10} />
                Đã tham gia
              </span>
            ) : null}
          </div>

          <h4 className="mt-2 line-clamp-2 text-sm font-bold text-slate-900">
            {project?.title}
          </h4>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1 text-slate-500">
                <Heart size={12} className="text-amber-500" />
                Đã góp: {formatCompactCurrencyVND(raisedAmount)}
              </span>
              <span className="text-amber-500">{fundingProgress}%</span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleOpenProject}
          className="mt-4 w-full rounded-xl bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] py-2.5 text-xs font-bold text-slate-900 transition hover:brightness-105"
        >
          {hasJoinedProject ? "Xem dự án" : "Đóng góp ngay"}
        </button>
      </div>
    </div>
  );
};

export default SpotlightWidget;
