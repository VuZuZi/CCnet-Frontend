import { useNavigate } from 'react-router-dom';
import {
  Bell,
  FolderKanban,
  ShieldCheck,
  Megaphone,
  HeartHandshake,
  UserPlus,
  CheckCheck,
  Trash2,
  ArrowUpRight,
  Dot,
  Heart,
  MessageCircle,
  BadgeInfo,
  CircleAlert,
  CircleCheckBig,
} from 'lucide-react';

import { getNotificationPrimaryActionLabel } from '../utils/notification.helpers';

function isDeletedProjectNotification(item) {
  const type = String(item?.type || '').toLowerCase();
  const metadata = item?.metadata || {};
  const title = String(item?.title || '').toLowerCase();

  return (
    (type === 'project_updated' && String(metadata?.status || '').toUpperCase() === 'DELETED') ||
    title.includes('project deleted by admin')
  );
}

function getTypeIcon(type) {
  switch (String(type || '').toLowerCase()) {
    case 'follow_created':
      return UserPlus;

    case 'project_updated':
    case 'project_approved':
    case 'project_cancelled':
    case 'project_rejected':
      return FolderKanban;

    case 'help_request_assigned':
    case 'help_request_reassigned':
    case 'help_request_verified':
    case 'help_request_rejected':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
      return HeartHandshake;

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

    case 'volunteer_applied':
    case 'volunteer_application_approved':
    case 'volunteer_application_rejected':
    case 'volunteer_withdraw_requested':
    case 'volunteer_withdraw_approved':
    case 'volunteer_withdraw_rejected':
      return Bell;

    case 'refund_request_submitted':
    case 'transaction_refunded':
    case 'refund_request_rejected':
    case 'transaction_failed':
    case 'donation_successful':
      return CircleCheckBig;

    default:
      return Bell;
  }
}

function getTypeAccent(isRead) {
  if (isRead) {
    return {
      wrapper: 'bg-slate-100 text-slate-500 border-slate-200',
      label: 'text-slate-400',
      glow: '',
    };
  }

  return {
    wrapper: 'bg-[#FFFBEB] text-[#F59E0B] border-[#FBBF24]/45',
    label: 'text-[#B45309]',
    glow: 'shadow-[0_6px_16px_rgba(251,191,36,0.16)]',
  };
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

    case 'help_request_assigned':
    case 'help_request_reassigned':
    case 'help_request_verified':
    case 'help_request_rejected':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
      return 'Yêu cầu trợ giúp';

    case 'organizer_request_submitted':
    case 'organizer_request_updated':
    case 'organizer_request_approved':
    case 'organizer_request_declined':
      return 'Nhà tổ chức';

    case 'system_announcement':
      return 'Hệ thống';

    case 'post_reacted':
    case 'post_commented':
      return 'Bài viết';

    case 'volunteer_applied':
    case 'volunteer_application_approved':
    case 'volunteer_application_rejected':
    case 'volunteer_withdraw_requested':
    case 'volunteer_withdraw_approved':
    case 'volunteer_withdraw_rejected':
      return 'Tình nguyện viên';

    case 'refund_request_submitted':
    case 'transaction_refunded':
    case 'refund_request_rejected':
    case 'transaction_failed':
    case 'donation_successful':
      return 'Giao dịch';

    default:
      return 'Thông báo';
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
      tone:
        'border-rose-200 bg-rose-50/80 text-rose-700',
    };
  }

  if (type === 'volunteer_withdraw_rejected') {
    return {
      icon: BadgeInfo,
      label: 'Ghi chú từ nhà tổ chức',
      value: reason,
      tone:
        'border-amber-200 bg-amber-50/80 text-amber-700',
    };
  }

  if (type === 'volunteer_withdraw_requested') {
    return {
      icon: BadgeInfo,
      label: 'Lý do xin rút',
      value: reason,
      tone:
        'border-amber-200 bg-amber-50/80 text-amber-700',
    };
  }

  return {
    icon: CircleCheckBig,
    label: 'Thông tin bổ sung',
    value: reason,
    tone:
      'border-sky-200 bg-sky-50/80 text-sky-700',
  };
}

export default function NotificationItem({ item, onRead, onDelete, onClose }) {
  const navigate = useNavigate();
  const Icon = getTypeIcon(item.type);
  const accent = getTypeAccent(item.isRead);
  const reasonBlock = getReasonBlock(item);

  const isDeletedProject = isDeletedProjectNotification(item);
  const resolvedActionUrl = isDeletedProject ? '/workspace' : item.actionUrl;

  const hasRelatedAction = Boolean(resolvedActionUrl);
  const canOpenDetail = Boolean(item.id && !resolvedActionUrl);
  const primaryActionLabel = isDeletedProject
    ? 'Xem workspace'
    : item.primaryActionLabel || getNotificationPrimaryActionLabel(item.type, resolvedActionUrl);

  const markReadIfNeeded = () => {
    if (!item.isRead && item.id) {
      onRead(item.id);
    }
  };

  const openNotificationDetail = () => {
    if (!item.id) return;

    markReadIfNeeded();
    onClose?.();
    navigate(`/notifications/${item.id}`);
  };

  const openRelatedContent = (event) => {
    event?.stopPropagation?.();

    if (!resolvedActionUrl) return;

    markReadIfNeeded();
    onClose?.();
    navigate(resolvedActionUrl);
  };

  const handleCardClick = () => {
    if (hasRelatedAction) {
      openRelatedContent();
      return;
    }

    if (canOpenDetail) {
      openNotificationDetail();
    }
  };

  const handleCardKeyDown = (event) => {
    if (!hasRelatedAction && !canOpenDetail) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  const isInteractive = hasRelatedAction || canOpenDetail;

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleCardClick : undefined}
      onKeyDown={handleCardKeyDown}
      className={`group relative border-b border-slate-100/80 px-5 py-3.5 transition-all duration-200 ${
        item.isRead
          ? 'bg-transparent'
          : 'bg-[linear-gradient(90deg,rgba(255,251,235,0.95),rgba(255,255,255,1))]'
      } ${isInteractive ? 'cursor-pointer hover:bg-white' : 'hover:bg-white'}`}
    >
      {!item.isRead && (
        <div className="absolute left-0 top-3.5 h-12 w-1 rounded-r-full bg-[#FBBF24]" />
      )}

      <div className="flex items-start gap-3.5">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${accent.wrapper} ${accent.glow} transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${accent.label}`}>
                  {item.label || getTypeLabel(item.type)}
                </p>
                {!item.isRead && <Dot size={13} className="text-[#F59E0B]" />}
              </div>

              <h4 className="mt-1 text-[16px] font-bold leading-5 tracking-tight text-slate-900">
                {item.title}
              </h4>
            </div>

            <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
              {item.createdAtLabel}
            </span>
          </div>

          <p className="mb-3 whitespace-pre-wrap text-[13px] leading-6 text-slate-600">
            {item.message}
          </p>

          {reasonBlock ? (
            <div
              className={`mb-3 rounded-2xl border px-3.5 py-3 ${reasonBlock.tone}`}
            >
              <div className="flex items-start gap-2.5">
                <reasonBlock.icon size={16} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
                    {reasonBlock.label}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-6">
                    {reasonBlock.value}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {!item.isRead && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRead(item.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <CheckCheck size={14} />
                Đánh dấu đã đọc
              </button>
            )}

            {hasRelatedAction ? (
              <button
                type="button"
                onClick={openRelatedContent}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-[#FFFBEB] px-3 py-1.5 text-[12px] font-semibold text-[#B45309] transition hover:border-amber-300 hover:bg-amber-50"
              >
                <ArrowUpRight size={14} />
                {primaryActionLabel || 'Mở liên quan'}
              </button>
            ) : null}

            {!hasRelatedAction && canOpenDetail ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openNotificationDetail();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <BadgeInfo size={14} />
                Xem chi tiết
              </button>
            ) : null}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(item.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100"
            >
              <Trash2 size={14} />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
