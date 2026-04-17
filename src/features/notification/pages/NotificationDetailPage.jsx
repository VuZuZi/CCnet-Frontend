import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from 'lucide-react';

import { notificationApi } from '../api/notification.api';
import {
  getNotificationPrimaryActionLabel,
  shouldPreferRelatedNavigation,
} from '../utils/notification.helpers';

function getTypeIcon(type) {
  switch (String(type || '').toLowerCase()) {
    case 'follow_created':
      return UserPlus;
    case 'project_updated':
    case 'project_approved':
    case 'project_cancelled':
    case 'project_rejected':
      return FolderKanban;
    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
      return ShieldCheck;
    case 'system_announcement':
      return Megaphone;
    case 'post_reacted':
      return Heart;
    case 'post_commented':
      return MessageCircle;
    case 'help_request_assigned':
    case 'help_request_reassigned':
    case 'help_request_verified':
    case 'help_request_rejected':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
      return HeartHandshake;
    default:
      return Bell;
  }
}

function getTypeLabel(type) {
  switch (String(type || '').toLowerCase()) {
    case 'follow_created':
      return 'Theo dõi';
    case 'project_updated':
    case 'project_approved':
    case 'project_cancelled':
    case 'project_rejected':
      return 'Dự án';
    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
      return 'Yêu cầu nhà tổ chức';
    case 'system_announcement':
      return 'Thông báo hệ thống';
    case 'post_reacted':
      return 'Phản ứng bài viết';
    case 'post_commented':
      return 'Bình luận bài viết';
    case 'help_request_assigned':
    case 'help_request_reassigned':
    case 'help_request_verified':
    case 'help_request_rejected':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
      return 'Yêu cầu trợ giúp';
    case 'volunteer_applied':
    case 'volunteer_application_approved':
    case 'volunteer_application_rejected':
    case 'volunteer_withdraw_requested':
    case 'volunteer_withdraw_approved':
    case 'volunteer_withdraw_rejected':
      return 'Tình nguyện viên';
    default:
      return 'Thông báo';
  }
}

function getSeverityLabel(severity) {
  const value = String(severity || 'info').toLowerCase();

  switch (value) {
    case 'success':
      return 'Thành công';
    case 'warning':
      return 'Cảnh báo';
    case 'error':
      return 'Lỗi';
    default:
      return 'Thông tin';
  }
}

function getSeverityClass(severity) {
  const value = String(severity || 'info').toLowerCase();

  switch (value) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'error':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

function formatDateTime(value) {
  if (!value) return '--';

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '--';
  }
}

function getReasonBlock(item) {
  const metadata = item?.metadata || {};

  const reason =
    metadata.rejectReason ||
    metadata.reviewNote ||
    metadata.withdrawReason ||
    metadata.rejectionReason ||
    null;

  if (!reason) return null;

  const type = String(item?.type || '').toLowerCase();

  if (
    type === 'volunteer_application_rejected' ||
    type === 'help_request_rejected' ||
    type === 'project_rejected' ||
    type === 'organizer_request_declined'
  ) {
    return {
      icon: CircleAlert,
      label: 'Lý do từ chối',
      value: reason,
      tone: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  if (type === 'volunteer_withdraw_rejected') {
    return {
      icon: BadgeInfo,
      label: 'Ghi chú từ organizer',
      value: reason,
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  if (type === 'volunteer_withdraw_requested') {
    return {
      icon: BadgeInfo,
      label: 'Lý do xin rút',
      value: reason,
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  return {
    icon: CircleCheckBig,
    label: 'Thông tin bổ sung',
    value: reason,
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
  };
}

export default function NotificationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await notificationApi.getNotificationById(id);
        setItem(data || null);
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            'Không tải được chi tiết notification.'
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

  const prefersRelatedNavigation = shouldPreferRelatedNavigation(
    item?.type,
    item?.actionUrl
  );
  const primaryActionLabel = getNotificationPrimaryActionLabel(
    item?.type,
    item?.actionUrl
  );
  const reasonBlock = getReasonBlock(item);

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
                    <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
                  </div>
                  <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="mt-4 h-6 w-40 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>

              <div className="mt-8 h-36 animate-pulse rounded-[28px] bg-slate-100" />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="h-24 animate-pulse rounded-[24px] bg-slate-100" />
                <div className="h-24 animate-pulse rounded-[24px] bg-slate-100" />
              </div>
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
              Không thể mở notification
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {errorMessage || 'Notification không tồn tại hoặc bạn không có quyền truy cập.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isRead = Boolean(item.readAt);

  if (prefersRelatedNavigation && item.actionUrl) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#FFFDF7]">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
          <div className="rounded-[32px] border border-[#F2E6C9] bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#FFF7DB] text-[#E99A00] shadow-[0_10px_30px_rgba(250,204,21,0.18)]">
                <ArrowUpRight size={28} />
              </div>

              <h1 className="mt-5 text-2xl font-black text-[#0F2747]">
                Notification này nên mở trực tiếp trang liên quan
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Bạn có thể chuyển thẳng đến nội dung liên quan để tiếp tục thao tác.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(item.actionUrl)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-[#FFFBEB] px-5 py-3 text-sm font-bold text-[#B45309] transition hover:bg-amber-50"
                >
                  <ArrowUpRight size={16} />
                  {primaryActionLabel || 'Mở liên quan'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Quay lại
                </button>
              </div>
            </div>
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
                      item.severity
                    )}`}
                  >
                    {getSeverityLabel(item.severity)}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${
                      isRead
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isRead ? 'Đã đọc' : 'Chưa đọc'}
                  </span>
                </div>

                <h1 className="text-3xl font-black leading-tight tracking-tight text-[#0F2747] lg:text-[40px]">
                  {item.title || 'Notification chưa có tiêu đề'}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <Clock3 size={15} className="text-[#D39200]" />
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>

                  {isRead && (
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
                {item.message || 'Không có nội dung tin nhắn.'}
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

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-[#FCFCFD] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  ID Notification
                </p>
                <p className="mt-3 break-all text-sm font-semibold text-slate-700">
                  {item._id || item.id || id}
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-[#FCFCFD] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Danh mục
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  {getTypeLabel(item.type)}
                </p>
              </div>
            </div>

            {item.actionUrl ? (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate(item.actionUrl)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-[#FFFBEB] px-5 py-3 text-sm font-bold text-[#B45309] transition hover:bg-amber-50"
                >
                  <ArrowUpRight size={16} />
                  {primaryActionLabel || 'Mở liên quan'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}