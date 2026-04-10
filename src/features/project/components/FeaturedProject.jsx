import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Users,
  Clock3,
  MapPin,
  AlertTriangle,
  Sparkles,
  Share2,
  UserRound,
} from "lucide-react";
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

function formatCurrencyVND(value) {
  return `${safeNumber(value).toLocaleString("vi-VN")}đ`;
}

function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]+>/g, "").trim();
}

function getDaysLeft(endDate) {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return null;

  const now = Date.now();
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getProjectImage(project) {
  if (project?.coverMedia?.url) return project.coverMedia.url;
  if (Array.isArray(project?.coverMedia) && project?.coverMedia[0]?.url) {
    return project.coverMedia[0].url;
  }
  return "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1600&auto=format&fit=crop";
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

function getVolunteerStats(project) {
  const volunteerNeeded =
    safeNumber(project?.stats?.targetVolunteers) ||
    safeNumber(project?.stats?.volunteerNeeded) ||
    (Array.isArray(project?.volunteerRoles)
      ? project.volunteerRoles.reduce(
          (sum, role) => sum + safeNumber(role?.quantity),
          0
        )
      : 0);

  const volunteerJoined =
    safeNumber(project?.stats?.currentVolunteers) ||
    safeNumber(project?.stats?.volunteerJoined) ||
    safeNumber(project?.stats?.volunteerCount) ||
    safeNumber(project?.volunteerCount);

  const volunteerProgress =
    safeNumber(project?.stats?.volunteerProgress) ||
    (volunteerNeeded > 0
      ? Math.min(Math.round((volunteerJoined / volunteerNeeded) * 100), 100)
      : 0);

  return {
    volunteerNeeded,
    volunteerJoined,
    volunteerProgress,
  };
}

function getProjectMode(project) {
  const isVolunteerOnly = project?.projectType === "VOLUNTEER_ONLY";
  const isFundedProject = project?.projectType === "FUNDED";
  const isVolunteerProject = isVolunteerOnly || !!project?.needsVolunteers;

  return {
    isVolunteerOnly,
    isVolunteerProject,
    isFundedProject,
  };
}

function isProjectClosed(project) {
  const normalizedStatus = String(project?.status || "").toUpperCase();
  return [
    "COMPLETED",
    "CLOSED",
    "CANCELLED",
    "COMPLETED_SUCCESSFULLY",
    "COMPLETED_PARTIAL",
  ].includes(normalizedStatus);
}

function scoreProject(project) {
  const { isVolunteerProject, isFundedProject } = getProjectMode(project);
  const { fundingProgress } = getFundingStats(project);
  const { volunteerProgress } = getVolunteerStats(project);

  const closed = isProjectClosed(project);
  const isVolunteerFull = !!project?.isVolunteerFull || volunteerProgress >= 100;
  const isFundingReached = fundingProgress >= 100;
  const isOpen = !closed && !isVolunteerFull && !isFundingReached;

  const isUrgent = !!project?.isUrgent;
  const daysLeft = getDaysLeft(project?.endDate);
  const isEndingSoon =
    typeof daysLeft === "number" && daysLeft >= 0 && daysLeft <= 14;
  const isNearlyFunded = fundingProgress >= 70 && fundingProgress < 100;
  const isNearlyFullVolunteer =
    volunteerProgress >= 70 && volunteerProgress < 100;

  let score = 0;

  if (isOpen) score += 100;
  if (isUrgent) score += 120;
  if (isEndingSoon) score += 70;
  if (isFundedProject) score += 60;
  if (isVolunteerProject) score += 40;
  if (isNearlyFunded) score += 90;
  if (isNearlyFullVolunteer) score += 70;

  score += Math.min(fundingProgress, 100);
  score += Math.min(volunteerProgress, 100) * 0.5;

  return score;
}

function getPrimaryAction(project, currentUserId, navigate) {
  const projectId = normalizeId(project?._id || project?.id);
  const organizerId = normalizeId(project?.organizerId);

  const isOwner = currentUserId && organizerId === currentUserId;
  const { isVolunteerOnly, isVolunteerProject, isFundedProject } =
    getProjectMode(project);

  const { fundingProgress } = getFundingStats(project);
  const { volunteerProgress } = getVolunteerStats(project);

  const closed = isProjectClosed(project);
  const isVolunteerFull = !!project?.isVolunteerFull || volunteerProgress >= 100;
  const isFundingReached = fundingProgress >= 100;

  if (isOwner) {
    return {
      label: "Quản lý",
      className: "bg-slate-900 text-white hover:bg-slate-800",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  if (closed || isVolunteerFull || isFundingReached) {
    return {
      label: "Xem chi tiết",
      className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  if (isFundedProject) {
    return {
      label: "Đóng góp",
      className: "bg-amber-400 text-slate-900 hover:bg-amber-500",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  if (isVolunteerOnly || isVolunteerProject) {
    return {
      label: "Tham gia",
      className: "bg-emerald-500 text-white hover:bg-emerald-600",
      onClick: () => navigate(`/projects/${projectId}`),
    };
  }

  return {
    label: "Xem chi tiết",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    onClick: () => navigate(`/projects/${projectId}`),
  };
}

export default function FeaturedProject({
  projects = [],
  followedOrganizerIds = [],
  onShare,
}) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = normalizeId(currentUser?._id || currentUser?.id);

  const featuredProject = useMemo(() => {
    if (!Array.isArray(projects) || projects.length === 0) return null;

    const normalizedFollowedIds = followedOrganizerIds.filter(Boolean);

    const nonOwnerCandidates = projects.filter((project) => {
      const organizerId = normalizeId(project?.organizerId);
      const isOwner = currentUserId && organizerId === currentUserId;
      return !isOwner;
    });

    const candidates =
      nonOwnerCandidates.length > 0 ? nonOwnerCandidates : projects;

    if (!candidates.length) return null;

    const followedProjects = candidates.filter((project) => {
      const organizerId = normalizeId(project?.organizerId);
      return normalizedFollowedIds.includes(organizerId);
    });

    const poolToRank =
      followedProjects.length > 0 ? followedProjects : candidates;

    const sorted = [...poolToRank].sort(
      (a, b) => scoreProject(b) - scoreProject(a)
    );

    return sorted[0] || null;
  }, [projects, followedOrganizerIds, currentUserId]);

  if (!featuredProject) return null;

  const projectId = normalizeId(featuredProject?._id || featuredProject?.id);
  const organizerRaw = featuredProject?.organizerId;
  const organizerId = normalizeId(organizerRaw);
  const organizerName =
    typeof organizerRaw === "object" ? organizerRaw?.fullName || "" : "";
  const isOwner = currentUserId && organizerId === currentUserId;
  const isFromFollowedOrganizer = followedOrganizerIds.includes(organizerId);

  const imageUrl = getProjectImage(featuredProject);
  const daysLeft = getDaysLeft(featuredProject?.endDate);

  const { isVolunteerProject, isFundedProject } =
    getProjectMode(featuredProject);
  const { fundingProgress, targetAmount, raisedAmount } =
    getFundingStats(featuredProject);
  const { volunteerNeeded, volunteerJoined, volunteerProgress } =
    getVolunteerStats(featuredProject);

  const primaryAction = getPrimaryAction(
    featuredProject,
    currentUserId,
    navigate
  );

  const showSecondaryVolunteerAction =
    !isOwner &&
    isFundedProject &&
    isVolunteerProject &&
    !isProjectClosed(featuredProject) &&
    volunteerProgress < 100;

  const handleShare = () => {
    if (typeof onShare === "function") {
      onShare(featuredProject);
      return;
    }

    const url = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard?.writeText(url);
  };

  return (
    <section className="w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-[300px] overflow-hidden bg-slate-100 lg:h-[500px]">
          <img
            src={imageUrl}
            alt={featuredProject?.title || "Featured project"}
            className="h-full w-full object-cover"
          />

          <div className="absolute bottom-5 left-5 flex flex-wrap gap-3">
            {featuredProject?.isUrgent && (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-sm">
                <AlertTriangle size={16} />
                KHẨN CẤP
              </span>
            )}

            {featuredProject?.location?.address && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <MapPin size={16} />
                {featuredProject.location.address}
              </span>
            )}

            {isFromFollowedOrganizer && !isOwner && (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800 shadow-sm">
                <Sparkles size={16} />
                Gợi ý từ người bạn theo dõi
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
              <Sparkles size={16} />
              DỰ ÁN NỔI BẬT DÀNH CHO BẠN
            </span>

            {typeof daysLeft === "number" && daysLeft >= 0 && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Clock3 size={16} />
                Còn {daysLeft} ngày
              </span>
            )}
          </div>

          <h2 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {featuredProject?.title}
          </h2>

          {!isOwner && organizerName ? (
            <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <UserRound size={15} className="flex-shrink-0" />
              <span className="truncate">{organizerName}</span>
            </div>
          ) : null}

          <p className="mb-5 line-clamp-3 text-base leading-7 text-slate-600">
            {stripHtml(featuredProject?.description) ||
              "Dự án đang chờ bạn khám phá."}
          </p>

          <div className="mb-6 flex flex-wrap gap-3">
            {isFromFollowedOrganizer && !isOwner && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                Đến từ organizer bạn đang theo dõi
              </span>
            )}

            {featuredProject?.isUrgent && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                Dự án đang cần hỗ trợ gấp
              </span>
            )}

            {fundingProgress >= 80 && fundingProgress < 100 && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                Chỉ còn ít nữa là đạt mục tiêu gây quỹ
              </span>
            )}

            {isOwner && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                Dự án của bạn
              </span>
            )}
          </div>

          {isFundedProject && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-slate-800">
                  <Heart size={18} className="text-amber-500" />
                  <div className="text-xl font-extrabold">
                    {formatCurrencyVND(raisedAmount)}
                    <span className="ml-2 text-base font-semibold text-slate-400">
                      / {formatCurrencyVND(targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="text-2xl font-extrabold text-amber-500">
                  {fundingProgress}%
                </div>
              </div>

              <div className="h-3.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {isVolunteerProject && (
            <div className="mb-6">
              <div className="flex items-center gap-3 text-lg font-semibold text-emerald-600">
                <Users size={18} />
                {volunteerJoined}/{volunteerNeeded || 0} tình nguyện viên
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={primaryAction.onClick}
              className={`h-14 rounded-2xl text-lg font-extrabold shadow-sm transition-all ${primaryAction.className}`}
            >
              {primaryAction.label}
            </button>

            {showSecondaryVolunteerAction ? (
              <button
                type="button"
                onClick={() => navigate(`/projects/${projectId}`)}
                className="h-14 rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-sm transition-all hover:bg-emerald-600"
              >
                Tham gia
              </button>
            ) : (
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                <Share2 size={18} />
                Chia sẻ
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}