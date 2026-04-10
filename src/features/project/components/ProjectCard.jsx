import { useState } from "react";
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

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return "";
}

function formatPostedDate(dateString) {
  if (!dateString) return "Không rõ ngày đăng";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Không rõ ngày đăng";

  const now = new Date();
  const diffMs = now - date;
  const oneHourMs = 60 * 60 * 1000;

  if (diffMs < oneHourMs) {
    return "Vừa đăng";
  }

  const datePart = date.toLocaleDateString("vi-VN");
  const timePart = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} • ${timePart}`;
}

function getDaysLeft(endDate) {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCategoryLabel(category) {
  const map = {
    Y_TE: "Y tế",
    GIAO_DUC: "Giáo dục",
    MOI_TRUONG: "Môi trường",
    THIEN_TAI: "Thiên tai",
    XAY_DUNG: "Xây dựng",
  };
  return map[category] || "Khác";
}

function isFundingCompleted(project, currentAmount, targetAmount, fundingPercent) {
  const normalizedStatus = String(project?.status || "").toUpperCase();

  return (
    (targetAmount > 0 && Number(currentAmount) >= Number(targetAmount)) ||
    Number(fundingPercent) >= 100 ||
    normalizedStatus === "COMPLETED_SUCCESSFULLY" ||
    normalizedStatus === "COMPLETED_PARTIAL"
  );
}

export function ProjectCard({ project }) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.user);

  const currentUserId = normalizeId(currentUser?._id || currentUser?.id);

  const organizerRaw = project?.organizerId;
  const organizerId = normalizeId(organizerRaw);
  const organizerName =
    typeof organizerRaw === "object"
      ? organizerRaw?.fullName || ""
      : "";

  const isOwner = Boolean(currentUserId && organizerId === currentUserId);

  const isVolunteerOnly = project?.projectType === "VOLUNTEER_ONLY";
  const isFunded = project?.projectType === "FUNDED" || !project?.projectType;
  const needsVolunteers = Boolean(project?.needsVolunteers || isVolunteerOnly);
  const isMixedProject = isFunded && needsVolunteers;

  const currentAmount = Number(
    project?.financialDetail?.availableBalance ?? project?.currentAmount ?? 0
  );

  const targetAmount = Number(project?.targetAmount || 0);

  const fundingPercent =
    targetAmount > 0
      ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
      : 0;

  const fundingCompleted = isFunded
    ? isFundingCompleted(project, currentAmount, targetAmount, fundingPercent)
    : false;

  const currentVolunteers = Number(
    project?.stats?.currentVolunteers ??
      project?.stats?.volunteerJoined ??
      0
  );

  const targetVolunteers =
    Number(
      project?.stats?.targetVolunteers ?? project?.stats?.volunteerNeeded ?? 0
    ) ||
    Number(
      Array.isArray(project?.volunteerRoles)
        ? project.volunteerRoles.reduce(
            (sum, role) => sum + Number(role?.quantity || 0),
            0
          )
        : 0
    );

  const volunteerPercent =
    targetVolunteers > 0
      ? Math.min(Math.round((currentVolunteers / targetVolunteers) * 100), 100)
      : 0;

  const isVolunteerFull =
    Boolean(project?.isVolunteerFull) ||
    (targetVolunteers > 0 && currentVolunteers >= targetVolunteers);

  const daysLeft = getDaysLeft(project?.endDate);
  const postedText = formatPostedDate(project?.createdAt);

  const getCategoryStyles = (cat) => {
    const styles = {
      Y_TE: "bg-card-blue-bg text-blue-800",
      GIAO_DUC: "bg-card-purple-bg text-purple-800",
      MOI_TRUONG: "bg-card-green-bg text-green-800",
      THIEN_TAI: "bg-red-50 text-red-800",
      XAY_DUNG: "bg-card-yellow-bg text-amber-800",
    };
    return styles[cat] || "bg-slate-100 text-slate-800";
  };

  const catStyle = getCategoryStyles(project?.category);

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

  const primaryAction = (() => {
    if (isOwner) {
      return {
        label: "Quản lý",
        className: "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
      };
    }

    if (isFunded && !fundingCompleted) {
      return {
        label: "Đóng góp",
        className:
          "bg-amber-400 text-slate-900 shadow-sm shadow-amber-500/20 hover:bg-amber-500",
      };
    }

    if ((isVolunteerOnly || needsVolunteers) && !isVolunteerFull && !isFunded) {
      return {
        label: "Tham gia",
        className:
          "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600",
      };
    }

    return {
      label: "Xem chi tiết",
      className:
        "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
    };
  })();

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
              className={`rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-sm ${catStyle}`}
            >
              {getCategoryLabel(project?.category)}
            </span>

            {(isVolunteerOnly || needsVolunteers) && (
              <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200/50 bg-emerald-100/90 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-sm">
                <Users size={12} strokeWidth={2.5} />
                {isMixedProject ? "Tuyển TNV" : "Tình nguyện"}
              </span>
            )}

            {fundingCompleted && (
              <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-emerald-100/95 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-sm">
                <CheckCircle2 size={12} strokeWidth={2.5} />
                Đã đạt mục tiêu
              </span>
            )}

            {isOwner && (
              <span className="rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm">
                Dự án của bạn
              </span>
            )}
          </div>

          {project?.isUrgent && !fundingCompleted && (
            <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm">
              KHẨN CẤP
            </span>
          )}
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

          <div className="mb-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              <CalendarDays size={13} />
              {postedText}
            </span>

            {daysLeft !== null && (
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
            )}

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
            {isFunded && (
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span className="text-slate-900">
                    {Number(currentAmount).toLocaleString("vi-VN")} đ{" "}
                    <span className="text-xs font-normal text-slate-500">
                      đã góp
                    </span>
                  </span>
                  <span
                    className={
                      fundingCompleted ? "text-emerald-600" : "text-amber-500"
                    }
                  >
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
            )}

            {(isVolunteerOnly || needsVolunteers) && (
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
            )}

            <div className="flex gap-3">
              <Link
                to={`/projects/${project?._id}`}
                className={`flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-bold transition-colors ${primaryAction.className}`}
              >
                {primaryAction.label}
              </Link>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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