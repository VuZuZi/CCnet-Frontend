import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Megaphone,
  FolderKanban,
  ShieldCheck,
  UserPlus,
  Clock3,
  CheckCircle2,
  MailWarning,
  Heart,
  MessageCircle,
  ArrowUpRight,
  HeartHandshake,
  CircleAlert,
  BadgeInfo,
  CircleCheckBig,
} from "lucide-react";

import { notificationApi } from "../api/notification.api";
import { getNotificationPrimaryActionLabel } from "../utils/notification.helpers";

function getTypeIcon(type) {
  switch (String(type || "").toLowerCase()) {
    case "follow_created":
      return UserPlus;

    case "project_updated":
    case "project_approved":
    case "project_cancelled":
    case "project_rejected":
    case "project_revision_requested":
      return FolderKanban;

    case "organizer_request_submitted":
    case "organizer_request_updated":
    case "organizer_request_approved":
    case "organizer_request_declined":
      return ShieldCheck;

    case "system_announcement":
      return Megaphone;

    case "post_reacted":
      return Heart;

    case "post_commented":
      return MessageCircle;

    case "refund_request_submitted":
    case "transaction_refunded":
    case "refund_request_rejected":
    case "transaction_failed":
    case "donation_successful":
      return CircleCheckBig;

    case "help_request_assigned":
    case "help_request_reassigned":
    case "help_request_verified":
    case "help_request_rejected":
    case "help_request_completed":
    case "help_request_assignment_responded":
      return HeartHandshake;

    case "volunteer_review_required":
    case "volunteer_review_submitted":
      return Bell;

    default:
      return Bell;
  }
}

function getTypeLabel(type) {
  switch (String(type || "").toLowerCase()) {
    case "follow_created":
      return "Theo dõi";

    case "project_updated":
    case "project_approved":
    case "project_cancelled":
    case "project_rejected":
    case "project_revision_requested":
      return "Dự án";

    case "organizer_request_submitted":
    case "organizer_request_updated":
    case "organizer_request_approved":
    case "organizer_request_declined":
      return "Yêu cầu tổ chức";

    case "system_announcement":
      return "Thông báo hệ thống";

    case "post_reacted":
      return "Phản ứng bài viết";

    case "post_commented":
      return "Bình luận bài viết";

    case "refund_request_submitted":
    case "transaction_refunded":
    case "refund_request_rejected":
    case "transaction_failed":
    case "donation_successful":
      return "Giao dịch";

    case "help_request_assigned":
    case "help_request_reassigned":
    case "help_request_verified":
    case "help_request_rejected":
    case "help_request_completed":
    case "help_request_assignment_responded":
      return "Yêu cầu trợ giúp";

    case "volunteer_applied":
    case "volunteer_application_approved":
    case "volunteer_application_rejected":
    case "volunteer_withdraw_requested":
    case "volunteer_withdraw_approved":
    case "volunteer_withdraw_rejected":
    case "volunteer_review_required":
    case "volunteer_review_submitted":
      return "Tình nguyện viên";

    default:
      return "Thông báo";
  }
}

function getSeverityLabel(severity) {
  const value = String(severity || "info").toLowerCase();

  switch (value) {
    case "success":
      return "Thành công";
    case "warning":
      return "Cảnh báo";
    case "error":
      return "Lỗi";
    default:
      return "Thông tin";
  }
}

function getSeverityClass(severity) {
  const value = String(severity || "info").toLowerCase();

  switch (value) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function formatDateTime(value) {
  if (!value) return "--";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "--";
  }
}

function getFeedbackText(item) {
  const metadata = item?.metadata || {};

  return (
    metadata.feedback ||
    metadata.reason ||
    metadata.rejectReason ||
    metadata.reviewNote ||
    metadata.withdrawReason ||
    metadata.rejectionReason ||
    metadata.adminFeedback ||
    metadata.decisionFeedback ||
    ""
  );
}

function getReasonBlock(item) {
  const value = getFeedbackText(item);
  if (!value) return null;

  const type = String(item?.type || "").toLowerCase();

  if (
    type === "volunteer_application_rejected" ||
    type === "help_request_rejected" ||
    type === "project_rejected" ||
    type === "organizer_request_declined"
  ) {
    return {
      icon: CircleAlert,
      label: "Lý do từ chối",
      value,
      tone: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (type === "project_revision_requested") {
    return {
      icon: BadgeInfo,
      label: "Nội dung cần chỉnh sửa",
      value,
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (type === "project_approved") {
    return {
      icon: CircleCheckBig,
      label: "Phản hồi phê duyệt",
      value,
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (type === "volunteer_withdraw_rejected") {
    return {
      icon: BadgeInfo,
      label: "Ghi chú từ tổ chức",
      value,
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (type === "volunteer_withdraw_requested") {
    return {
      icon: BadgeInfo,
      label: "Lý do xin rút",
      value,
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    icon: CircleCheckBig,
    label: "Thông tin bổ sung",
    value,
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  };
}

function isRejectedProjectNotification(item) {
  const type = String(item?.type || "").toLowerCase();
  const metadata = item?.metadata || {};
  const status = String(metadata?.status || "").toUpperCase();
  const decision = String(metadata?.decision || "").toUpperCase();

  return (
    type === "project_rejected" ||
    status === "REJECTED" ||
    decision === "REJECTED"
  );
}

function getNotificationProjectId(item) {
  const metadata = item?.metadata || {};

  return (
    metadata.projectId ||
    metadata.project ||
    item?.entityId ||
    item?.projectId ||
    null
  );
}

function buildRejectedProjectEditUrl(item) {
  const projectId = getNotificationProjectId(item);
  if (!projectId) return null;

  return `/projects/create/${projectId}/edit?mode=rejected&resubmit=true`;
}

function resolveActionUrl(item) {
  if (isRejectedProjectNotification(item)) {
    return buildRejectedProjectEditUrl(item) || item?.actionUrl || "";
  }

  return item?.actionUrl || "";
}

function resolveActionLabel(item, actionUrl) {
  if (isRejectedProjectNotification(item) && buildRejectedProjectEditUrl(item)) {
    return "Chỉnh sửa dự án";
  }

  return getNotificationPrimaryActionLabel(item?.type, actionUrl) || "Mở liên quan";
}

export default function NotificationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await notificationApi.getNotificationById(id);
        setItem(data || null);

        if (data && !data.isRead && (data._id || data.id)) {
          notificationApi.markAsRead(data._id || data.id).catch(() => {});
        }
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Không tải được chi tiết thông báo.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  const Icon = useMemo(() => getTypeIcon(item?.type), [item?.type]);
  const reasonBlock = getReasonBlock(item);
  const isRead = Boolean(item?.isRead || item?.readAt);

  const actionUrl = resolveActionUrl(item);
  const actionLabel = resolveActionLabel(item, actionUrl);
  const isRejectedProject = isRejectedProjectNotification(item);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#FFFDF7]">
        <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
          <div className="mb-6">
            <div className="h-12 w-32 animate-pulse rounded-2xl bg-[#F8E7B2]" />
          </div>

          <div className="overflow-hidden rounded-[32px] border border-[#F2E6C9] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="h-2 w-full bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#FDE68A]" />
            <div className="p-8 lg:p-10">
              <div className="flex items-start gap-5">
                <div className="h-16 w-16 animate-pulse rounded-[24px] bg-[#FFF7DB]" />
                <div className="min-w-0 flex-1">
                  <div className="mb-4 flex gap-2">
                    <div className="h-8 w-36 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
                  </div>
                  <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="mt-4 h-6 w-40 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>

              <div className="mt-8 h-36 animate-pulse rounded-[28px] bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !item) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#FFFDF7]">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-[#E9D8A6] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E3A5F] transition hover:-translate-y-0.5 hover:bg-[#FFF8E8]"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>

          <div className="rounded-[32px] border border-rose-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-rose-50 text-rose-500">
              <MailWarning size={28} />
            </div>
            <h1 className="mt-5 text-2xl font-black text-slate-900">
              Không thể mở thông báo
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {errorMessage ||
                "Thông báo không tồn tại hoặc bạn không có quyền truy cập."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top,#FFF5CC_0%,#FFF8E8_18%,#FFFDF7_42%,#FFFDF7_100%)]">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#E9D8A6] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#1E3A5F] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#FFF8E8]"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[#F2E6C9] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
          <div className="h-2 w-full bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#FDE68A]" />

          <div className="p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,#FFF8DF_0%,#FFF1BF_100%)] text-[#E99A00] shadow-[0_10px_30px_rgba(250,204,21,0.18)]">
                <Icon size={34} strokeWidth={2.2} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center rounded-full border border-[#E7D9AE] bg-[#FFF8E1] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9A6700]">
                    {getTypeLabel(item.type)}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${getSeverityClass(
                      item.severity,
                    )}`}
                  >
                    {getSeverityLabel(item.severity)}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${
                      isRead
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {isRead ? "Đã đọc" : "Chưa đọc"}
                  </span>
                </div>

                <h1 className="text-3xl font-black leading-tight tracking-tight text-[#0F2747] lg:text-[40px]">
                  {item.title || "Thông báo chưa có tiêu đề"}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <Clock3 size={15} className="text-[#D39200]" />
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>

                  {item.readAt && (
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>Đọc lúc {formatDateTime(item.readAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-[#F4E8C9] bg-[linear-gradient(180deg,#FFFDF8_0%,#FFF8E8_100%)] p-6 lg:p-7">
              <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700 lg:text-base">
                {item.message || "Không có nội dung tin nhắn."}
              </p>
            </div>

            {reasonBlock ? (
              <div className={`mt-6 rounded-[24px] border p-5 ${reasonBlock.tone}`}>
                <div className="flex items-start gap-3">
                  <reasonBlock.icon size={18} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">
                      {reasonBlock.label}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7">
                      {reasonBlock.value}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {isRejectedProject ? (
              <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
                <p className="font-bold">Dự án đã bị từ chối</p>
                <p className="mt-1">
                  Bạn có thể bấm nút Chỉnh sửa dự án để mở lại biểu mẫu. Hệ
                  thống sẽ tự động điền toàn bộ dữ liệu cũ của dự án vào form để
                  bạn chỉnh sửa và gửi lại kiểm duyệt.
                </p>
              </div>
            ) : null}

            {actionUrl ? (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate(actionUrl)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition ${
                    isRejectedProject
                      ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-amber-200 bg-[#FFFBEB] text-[#B45309] hover:bg-amber-50"
                  }`}
                >
                  <ArrowUpRight size={16} />
                  {actionLabel}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
