import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Share2,
  Users,
  CalendarDays,
  Clock3,
  CircleDot,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import { ShareModal } from "../../Community/components/common/ShareModal";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  formatProjectPostedDate,
  getProjectCategoryLabel,
  getProjectCategoryStyles,
  getProjectDaysLeft,
  getProjectFundingStats,
  getProjectMode,
  getProjectPrimaryAction,
  getProjectVolunteerStats,
  normalizeProjectId,
  stripProjectHtml,
  isProjectFundingCompleted,
} from "../utils/projectDisplay.utils";

export function ProjectCard({ project }) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.user);

  const currentUserId = normalizeProjectId(
    currentUser?._id || currentUser?.id || currentUser?.userId,
  );

  const organizerRaw = project?.organizerId;
  const organizerId = normalizeProjectId(organizerRaw);
  const organizerName =
    typeof organizerRaw === "object" ? organizerRaw?.fullName || "" : "";

  const isOwner = Boolean(currentUserId && organizerId === currentUserId);

  const { isVolunteerOnly, isFunded, needsVolunteers, isMixedProject } = useMemo(
    () => getProjectMode(project),
    [project],
  );

  const { currentAmount, targetAmount, fundingPercent } = useMemo(
    () => getProjectFundingStats(project),
    [project],
  );

  const {
    currentVolunteers,
    targetVolunteers,
    volunteerPercent,
    isVolunteerFull,
  } = useMemo(() => getProjectVolunteerStats(project), [project]);

  const fundingCompleted = useMemo(
    () => isProjectFundingCompleted(project),
    [project],
  );

  const daysLeft = getProjectDaysLeft(project?.endDate);
  const postedText = formatProjectPostedDate(project?.createdAt);
  const categoryStyle = getProjectCategoryStyles(project?.category);

  const shareData = {
    entityId: project?._id,
    entityModel: "Project",
    title: project?.title,
    thumbnail: project?.coverMedia?.url || "",
    description:
      project?.summary ||
      project?.description ||
      "Hãy cùng chung tay đóng góp cho dự án ý nghĩa này!",
  };

  const primaryAction = getProjectPrimaryAction({
    project,
    currentUserId,
    isOwner,
    navigate: (path) => {
      window.location.href = path;
    },
  });

  return (
    <>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative h-48 flex-shrink-0 overflow-hidden bg-slate-200">
          <img
            src={project?.coverMedia?.url || "/placeholder-project.jpg"}
            alt={project?.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
            <span
              className={`rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-sm ${categoryStyle}`}
            >
              {getProjectCategoryLabel(project?.category)}
            </span>

            {isVolunteerOnly || needsVolunteers ? (
              <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200/50 bg-emerald-100/90 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-sm">
                <Users size={12} strokeWidth={2.5} />
                {isMixedProject ? "Tuyển TNV" : "Tình nguyện"}
              </span>
            ) : null}

            {fundingCompleted ? (
              <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-emerald-100/95 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-sm">
                <CheckCircle2 size={12} strokeWidth={2.5} />
                Đã đạt mục tiêu
              </span>
            ) : null}

            {isOwner ? (
              <span className="rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm">
                Dự án của bạn
              </span>
            ) : null}
          </div>

          {project?.isUrgent && !fundingCompleted ? (
            <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm">
              KHẨN CẤP
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h4 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-amber-600">
            <Link
              to={`/projects/${project?._id}`}
              className="focus:outline-none before:absolute before:inset-0"
            >
              {project?.title}
            </Link>
          </h4>

          {!isOwner && organizerName ? (
            <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <UserRound size={15} className="flex-shrink-0" />
              <span className="truncate">{organizerName}</span>
            </div>
          ) : null}

          <div className="mb-3 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={16} className="flex-shrink-0" />
            <span className="truncate">
              {project?.location?.address || "Chưa cập nhật địa điểm"}
            </span>
          </div>

          <p className="mb-4 line-clamp-2 text-sm text-slate-500">
            {stripProjectHtml(project?.summary || project?.description) ||
              "Dự án đang chờ bạn khám phá."}
          </p>

          <div className="mb-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              <CalendarDays size={13} />
              {postedText}
            </span>

            {daysLeft !== null ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  daysLeft < 0
                    ? "border-slate-200 bg-slate-50 text-slate-500"
                    : daysLeft <= 7
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                <Clock3 size={13} />
                {daysLeft < 0
                  ? "Đã kết thúc"
                  : daysLeft === 0
                    ? "Hôm nay"
                    : `Còn ${daysLeft} ngày`}
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              <CircleDot size={12} />
              {isFunded
                ? fundingCompleted
                  ? "Hoàn thành gây quỹ"
                  : needsVolunteers
                    ? "Gây quỹ + tuyển TNV"
                    : "Gây quỹ"
                : isVolunteerFull
                  ? "Đã đủ TNV"
                  : "Đang tuyển TNV"}
            </span>
          </div>

          <div className="relative z-10 mt-auto">
            {isFunded ? (
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span className="text-slate-900">
                    {currentAmount.toLocaleString("vi-VN")} đ{" "}
                    <span className="text-xs font-normal text-slate-500">
                      đã góp
                    </span>
                  </span>
                  <span className={fundingCompleted ? "text-emerald-600" : "text-amber-500"}>
                    {fundingPercent}%
                  </span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      fundingCompleted ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                    style={{ width: `${fundingPercent}%` }}
                  />
                </div>
              </div>
            ) : null}

            {isVolunteerOnly || needsVolunteers ? (
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span className="text-slate-900">
                    {currentVolunteers.toLocaleString("vi-VN")}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      / {targetVolunteers} TNV
                    </span>
                  </span>
                  <span className="text-emerald-600">{volunteerPercent}%</span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-1000 ease-out"
                    style={{ width: `${volunteerPercent}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              <Link
                to={`/projects/${project?._id}`}
                className={`flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-bold transition-colors ${primaryAction.className}`}
              >
                {primaryAction.label}
              </Link>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsShareOpen(true);
                }}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        sharedData={shareData}
        initialText={`Dự án ý nghĩa: "${project?.title}". Mọi người cùng chung tay nhé! 🚀`}
      />
    </>
  );
}

export default ProjectCard;