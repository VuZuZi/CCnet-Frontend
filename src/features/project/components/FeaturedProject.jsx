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
import {
  formatProjectCurrencyVND,
  getProjectDaysLeft,
  getProjectFundingStats,
  getProjectImage,
  getProjectMode,
  getProjectPrimaryAction,
  getProjectVolunteerStats,
  isProjectClosed,
  normalizeProjectId,
  scoreFeaturedProject,
  stripProjectHtml,
} from "../utils/projectDisplay.utils";

export default function FeaturedProject({
  projects = [],
  followedOrganizerIds = [],
  onShare,
}) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = normalizeProjectId(
    currentUser?._id || currentUser?.id || currentUser?.userId,
  );

  const featuredProject = useMemo(() => {
    if (!Array.isArray(projects) || projects.length === 0) return null;

    const normalizedFollowedIds = followedOrganizerIds
      .filter(Boolean)
      .map((id) => normalizeProjectId(id));

    const nonOwnerCandidates = projects.filter((project) => {
      const organizerId = normalizeProjectId(project?.organizerId);
      return !(currentUserId && organizerId === currentUserId);
    });

    const candidates = nonOwnerCandidates.length > 0 ? nonOwnerCandidates : projects;
    if (!candidates.length) return null;

    const followedProjects = candidates.filter((project) => {
      const organizerId = normalizeProjectId(project?.organizerId);
      return normalizedFollowedIds.includes(organizerId);
    });

    const pool = followedProjects.length > 0 ? followedProjects : candidates;

    return [...pool].sort(
      (a, b) => scoreFeaturedProject(b) - scoreFeaturedProject(a),
    )[0] || null;
  }, [projects, followedOrganizerIds, currentUserId]);

  if (!featuredProject) return null;

  const projectId = normalizeProjectId(
    featuredProject?._id || featuredProject?.id,
  );
  const organizerRaw = featuredProject?.organizerId;
  const organizerId = normalizeProjectId(organizerRaw);
  const organizerName =
    typeof organizerRaw === "object" ? organizerRaw?.fullName || "" : "";

  const normalizedFollowedIds = followedOrganizerIds
    .filter(Boolean)
    .map((id) => normalizeProjectId(id));

  const isOwner = Boolean(currentUserId && organizerId === currentUserId);
  const isFromFollowedOrganizer = normalizedFollowedIds.includes(organizerId);

  const imageUrl = getProjectImage(featuredProject);
  const daysLeft = getProjectDaysLeft(featuredProject?.endDate);

  const { isVolunteerProject, isFundedProject } = getProjectMode(featuredProject);
  const { fundingPercent, targetAmount, raisedAmount } =
    getProjectFundingStats(featuredProject);
  const { volunteerNeeded, volunteerJoined, volunteerProgress } =
    getProjectVolunteerStats(featuredProject);

  const primaryAction = getProjectPrimaryAction({
    project: featuredProject,
    currentUserId,
    isOwner,
    navigate,
  });

  const showSecondaryVolunteerAction =
    !isOwner &&
    isFundedProject &&
    isVolunteerProject &&
    !isProjectClosed(featuredProject) &&
    volunteerProgress < 100;

  const handleShare = async () => {
    if (typeof onShare === "function") {
      onShare(featuredProject);
      return;
    }

    const url = `${window.location.origin}/projects/${projectId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: featuredProject?.title || "Project",
          text: "Xem dự án này trên CCNet",
          url,
        });
        return;
      }

      await navigator.clipboard?.writeText(url);
    } catch {}
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
            {featuredProject?.isUrgent ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-sm">
                <AlertTriangle size={16} />
                KHẨN CẤP
              </span>
            ) : null}

            {featuredProject?.location?.address ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <MapPin size={16} />
                {featuredProject.location.address}
              </span>
            ) : null}

            {isFromFollowedOrganizer && !isOwner ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800 shadow-sm">
                <Sparkles size={16} />
                Gợi ý từ người bạn theo dõi
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
              <Sparkles size={16} />
              DỰ ÁN NỔI BẬT DÀNH CHO BẠN
            </span>

            {typeof daysLeft === "number" && daysLeft >= 0 ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Clock3 size={16} />
                Còn {daysLeft} ngày
              </span>
            ) : null}
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
            {stripProjectHtml(featuredProject?.description) ||
              "Dự án đang chờ bạn khám phá."}
          </p>

          <div className="mb-6 flex flex-wrap gap-3">
            {isFromFollowedOrganizer && !isOwner ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                Đến từ organizer bạn đang theo dõi
              </span>
            ) : null}

            {featuredProject?.isUrgent ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                Dự án đang cần hỗ trợ gấp
              </span>
            ) : null}

            {fundingPercent >= 80 && fundingPercent < 100 ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                Chỉ còn ít nữa là đạt mục tiêu gây quỹ
              </span>
            ) : null}

            {isOwner ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                Dự án của bạn
              </span>
            ) : null}
          </div>

          {isFundedProject ? (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-slate-800">
                  <Heart size={18} className="text-amber-500" />
                  <div className="text-xl font-extrabold">
                    {formatProjectCurrencyVND(raisedAmount)}
                    <span className="ml-2 text-base font-semibold text-slate-400">
                      / {formatProjectCurrencyVND(targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="text-2xl font-extrabold text-amber-500">
                  {fundingPercent}%
                </div>
              </div>

              <div className="h-3.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(fundingPercent, 100)}%` }}
                />
              </div>
            </div>
          ) : null}

          {isVolunteerProject ? (
            <div className="mb-6">
              <div className="flex items-center gap-3 text-lg font-semibold text-emerald-600">
                <Users size={18} />
                {volunteerJoined}/{volunteerNeeded || 0} tình nguyện viên
              </div>
            </div>
          ) : null}

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