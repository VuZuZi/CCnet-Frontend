import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFeaturedProject } from "@/features/project/hooks/useProjectQueries";

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
    Y_TE: "Health",
    GIAO_DUC: "Education",
    MOI_TRUONG: "Environment",
    THIEN_TAI: "Urgent",
    XAY_DUNG: "Construction",
  };
  return map[category] || "Project";
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

function formatCompactCurrency(value) {
  const amount = safeNumber(value);

  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(
      amount % 1_000_000_000 === 0 ? 0 : 1
    )}B`;
  }

  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(
      amount % 1_000_000 === 0 ? 0 : 1
    )}M`;
  }

  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}K`;
  }

  return `$${amount}`;
}

const SpotlightWidget = () => {
  const navigate = useNavigate();
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
          <span className="material-symbols-outlined text-[20px] text-red-600">
            campaign
          </span>
          <span className="text-xs font-bold uppercase text-red-700">
            Urgent Need
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

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-red-50 p-4">
        <span className="material-symbols-outlined text-[20px] text-red-600">
          campaign
        </span>
        <span className="text-xs font-bold uppercase text-red-700">
          Urgent Need
        </span>
      </div>

      <div className="p-5">
        <button type="button" onClick={handleOpenProject} className="w-full text-left">
          <div
            className="mb-4 aspect-video w-full rounded-xl bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />

          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-600">
            {categoryLabel}
          </span>

          <h4 className="mt-2 line-clamp-2 text-sm font-bold text-slate-900">
            {project?.title}
          </h4>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[11px] font-bold">
              <span className="text-slate-500">
                Raised: {formatCompactCurrency(raisedAmount)}
              </span>
              <span className="text-primary">{fundingProgress}%</span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleOpenProject}
          className="mt-4 w-full rounded-xl bg-primary py-2 text-xs font-bold text-white transition-colors hover:bg-yellow-500"
        >
          Donate Now
        </button>
      </div>
    </div>
  );
};

export default SpotlightWidget;