import {
  BadgeCheck,
  CalendarDays,
  HeartHandshake,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Clock3,
  Send,
  Star,
} from "lucide-react";
import { ApplyVolunteerButton } from "@/features/volunteer/components/ApplyVolunteerButton";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDateRange(startDate, endDate) {
  const formatValue = (value) => {
    if (!value) return "--/--/----";

    try {
      return new Date(value).toLocaleDateString("vi-VN");
    } catch {
      return "--/--/----";
    }
  };

  return `${formatValue(startDate)} - ${formatValue(endDate)}`;
}

function formatDateTime(value) {
  if (!value) return null;

  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return null;
  }
}

function getVolunteerStatusMeta(status) {
  const normalized = String(status || "").toUpperCase();

  switch (normalized) {
    case "WITHDRAW_REQUESTED":
      return {
        badgeClass: "bg-amber-100 text-amber-800",
        panelClass:
          "border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFBEB_100%)]",
        iconClass: "bg-white text-amber-700",
        label: "Đang chờ duyệt rút",
        description:
          "Bạn đã gửi yêu cầu xin rút khỏi dự án. Hãy chờ người tổ chức phản hồi.",
      };

    case "APPROVED":
    default:
      return {
        badgeClass: "bg-emerald-100 text-emerald-800",
        panelClass:
          "border-emerald-100 bg-[linear-gradient(180deg,#F7FFF9_0%,#ECFDF3_100%)]",
        iconClass: "bg-white text-emerald-700",
        label: "Thành viên đang hoạt động",
        description:
          "Bạn đã được duyệt và đang là tình nguyện viên của dự án này.",
      };
  }
}

const COMPLETED_PROJECT_STATUSES = new Set([
  "COMPLETED",
  "COMPLETED_SUCCESSFULLY",
  "COMPLETED_PARTIAL",
]);

export function SidebarVolunteer({
  project,
  projectConversation,
  onOpenProjectGroup,
  onOpenCommunityTab,
  onOpenFinancialsTab,
  applicationStatus,
  isCheckingApplication = false,
  myReview = null,
  isFetchingMyReview = false,
}) {
  const isFunded = project?.projectType === "FUNDED" || !project?.projectType;

  const normalizedProjectStatus = String(project?.status || "").toUpperCase();
  const isCompletedProject =
    COMPLETED_PROJECT_STATUSES.has(normalizedProjectStatus);

  const availableBalance =
    project?.financialDetail?.availableBalance ?? project?.currentAmount ?? 0;
  const targetAmount = project?.targetAmount ?? 1;
  const progressPercent = Math.min(
    Math.round((availableBalance / Math.max(targetAmount, 1)) * 100),
    100
  );

  const currentVolunteers = Number(project?.stats?.currentVolunteers || 0);
  const targetVolunteers = Number(project?.stats?.targetVolunteers || 0);

  const hasProjectGroup = Boolean(projectConversation?._id);
  const statusMeta = getVolunteerStatusMeta(applicationStatus);

  const hasReview = Boolean(myReview);
  const reviewedAtText = formatDateTime(myReview?.reviewedAt);
  const reviewScore = Number(myReview?.score || 0);
  const reviewComment =
    myReview?.comment ||
    "Bạn đã hoàn thành tốt vai trò tình nguyện viên trong dự án.";

  return (
    <div className="flex flex-col gap-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            <Sparkles size={11} />
            Chế độ tình nguyện viên
          </div>

          <h2 className="text-lg font-extrabold text-slate-900">
            Bạn đang tham gia dự án
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tiến độ dự án và mở nhanh các thao tác dành cho tình nguyện
            viên.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-white shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
            Thành viên
          </span>
        </div>
      </div>

      <div className={`rounded-[26px] border p-5 ${statusMeta.panelClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
              Trạng thái tham gia
            </p>

            <div
              className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-extrabold shadow-sm ${statusMeta.badgeClass}`}
            >
              {applicationStatus === "WITHDRAW_REQUESTED" ? (
                <Clock3 className="h-4 w-4" />
              ) : (
                <BadgeCheck className="h-4 w-4" />
              )}
              {statusMeta.label}
            </div>

            <p className="mt-3 text-sm text-slate-600">
              {statusMeta.description}
            </p>

            {isCheckingApplication ? (
              <p className="mt-2 text-xs text-slate-500">
                Đang đồng bộ trạng thái tham gia...
              </p>
            ) : null}
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${statusMeta.iconClass}`}
          >
            {applicationStatus === "WITHDRAW_REQUESTED" ? (
              <Send className="h-6 w-6" />
            ) : (
              <HeartHandshake className="h-6 w-6" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            <CalendarDays className="h-4 w-4" />
            Thời gian
          </div>
          <p className="text-sm font-bold text-slate-900">
            {formatDateRange(project?.startDate, project?.endDate)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            <Users className="h-4 w-4" />
            Tình nguyện viên
          </div>
          <p className="text-sm font-bold text-slate-900">
            {currentVolunteers}
            {targetVolunteers > 0 ? ` / ${targetVolunteers}` : ""} thành viên
          </p>
        </div>
      </div>

      {isCompletedProject && hasReview ? (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-900">Đánh giá của bạn</p>
            <p className="mt-1 text-xs text-slate-500">
              Xem đánh giá mà người tổ chức đã gửi cho phần tham gia của bạn.
            </p>
          </div>

          {isFetchingMyReview ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
              Đang tải đánh giá...
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFBEB_100%)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        reviewScore >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>

                {reviewedAtText ? (
                  <span className="text-xs font-medium text-slate-500">
                    {reviewedAtText}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {reviewComment}
              </p>
            </div>
          )}
        </div>
      ) : null}

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-900">Hành động của bạn</p>
          <p className="mt-1 text-xs text-slate-500">
            {isCompletedProject
              ? "Dự án đã hoàn thành nên bạn không thể gửi yêu cầu xin rút khỏi dự án."
              : "Quản lý trạng thái tham gia hoặc gửi yêu cầu xin rút khỏi dự án."}
          </p>
        </div>

        {!isCompletedProject ? (
          <ApplyVolunteerButton
            project={project}
            projectId={project?._id || project?.id}
            projectName={project?.title || project?.name || ""}
            className="bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] text-slate-900 hover:bg-[linear-gradient(135deg,#FFCA28_0%,#FFB300_100%)] shadow-[0_14px_30px_rgba(255,193,7,0.28)] hover:shadow-[0_18px_36px_rgba(255,179,0,0.34)]"
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
            Dự án đã hoàn thành.
          </div>
        )}
      </div>

      {isFunded ? (
        <div className="rounded-[26px] border border-amber-100 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFBEB_100%)] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-700">
            Quỹ đang được giữ
          </p>

          <div className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
            {formatCurrency(availableBalance)}đ
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Mục tiêu: {formatCurrency(targetAmount)}đ
          </p>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={onOpenFinancialsTab}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-[#FFFBEB] px-5 py-3.5 text-sm font-bold text-amber-900 transition hover:border-amber-300 hover:bg-amber-100"
            >
              <Wallet className="h-4 w-4" />
              Xem tiến độ tài chính
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-900">Nhóm dự án</p>
          <p className="mt-1 text-xs text-slate-500">
            Trao đổi với người tổ chức và các tình nguyện viên khác trong nhóm
            chat.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProjectGroup}
          disabled={!hasProjectGroup}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition ${
            hasProjectGroup
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100"
              : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          {hasProjectGroup ? "Mở nhóm dự án" : "Chưa có nhóm dự án"}
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-900">Cộng đồng dự án</p>
          <p className="mt-1 text-xs text-slate-500">
            Theo dõi cập nhật mới, bài đăng và tương tác trong cộng đồng dự án.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCommunityTab}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
        >
          <Users className="h-4 w-4" />
          Mở tab cộng đồng
        </button>
      </div>
    </div>
  );
}

export default SidebarVolunteer;