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
  Eye,
  Heart,
  MessageCircle,
} from 'lucide-react';

function getTypeIcon(type) {
  switch (type) {
    case 'follow_created':
      return UserPlus;
    case 'project_updated':
      return FolderKanban;
    case 'help_request_assigned':
    case 'help_request_verified':
    case 'help_request_completed':
    case 'help_request_assignment_responded':
      return HeartHandshake;
    case 'organizer_request_submitted':
    case 'organizer_request_updated':
      return ShieldCheck;
    case 'system_announcement':
      return Megaphone;
    case 'post_reacted':
      return Heart;
    case 'post_commented':
      return MessageCircle;
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

function isPostNotification(type) {
  return type === 'post_reacted' || type === 'post_commented';
}

export default function NotificationItem({ item, onRead, onDelete, onClose }) {
  const navigate = useNavigate();
  const Icon = getTypeIcon(item.type);
  const accent = getTypeAccent(item.isRead);
  const hasRelatedAction = Boolean(item.actionUrl);
  const shouldOpenRelatedOnCardClick = isPostNotification(item.type) && hasRelatedAction;
  const canOpenDetail = Boolean(item.id);

  const openNotificationDetail = () => {
    if (!item.id) return;

    if (!item.isRead) {
      onRead(item.id);
    }

    onClose?.();
    navigate(`/notifications/${item.id}`);
  };

  const openRelatedContent = (event) => {
    event?.stopPropagation?.();

    if (!item.actionUrl) return;

    if (!item.isRead) {
      onRead(item.id);
    }

    onClose?.();
    navigate(item.actionUrl);
  };

  const handleCardClick = () => {
    if (shouldOpenRelatedOnCardClick) {
      openRelatedContent();
      return;
    }

    if (canOpenDetail) {
      openNotificationDetail();
    }
  };

  const handleCardKeyDown = (event) => {
    if (!canOpenDetail && !shouldOpenRelatedOnCardClick) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      role={canOpenDetail || shouldOpenRelatedOnCardClick ? 'button' : undefined}
      tabIndex={canOpenDetail || shouldOpenRelatedOnCardClick ? 0 : undefined}
      onClick={canOpenDetail || shouldOpenRelatedOnCardClick ? handleCardClick : undefined}
      onKeyDown={handleCardKeyDown}
      className={`group relative border-b border-slate-100/80 px-5 py-3.5 transition-all duration-200 ${
        item.isRead
          ? 'bg-transparent'
          : 'bg-[linear-gradient(90deg,rgba(255,251,235,0.95),rgba(255,255,255,1))]'
      } ${(canOpenDetail || shouldOpenRelatedOnCardClick) ? 'cursor-pointer hover:bg-white' : 'hover:bg-white'}`}
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
                  {item.label}
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
                Mark read
              </button>
            )}

            {canOpenDetail && !shouldOpenRelatedOnCardClick && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openNotificationDetail();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Eye size={14} />
                View detail
              </button>
            )}

            {hasRelatedAction && (
              <button
                type="button"
                onClick={openRelatedContent}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-[#FFFBEB] px-3 py-1.5 text-[12px] font-semibold text-[#B45309] transition hover:border-amber-300 hover:bg-amber-50"
              >
                <ArrowUpRight size={14} />
                {isPostNotification(item.type) ? 'Open post' : 'Open related'}
              </button>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(item.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}