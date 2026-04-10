import { Settings, Sparkles } from 'lucide-react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import NotificationList from './NotificationList';

export default function NotificationDropdown({
  isOpen,
  items,
  unreadCount,
  isLoading,
  onMarkAllRead,
  onRead,
  onDelete,
  onClose,
  onOpenSettings,
}) {
  const user = useAuthStore(authSelectors.user);
  const role = String(user?.role || '').toLowerCase();
  const canManageSettings = role === 'user' || role === 'organizer';

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 slide-in-from-top-2 absolute right-0 top-16 z-50 w-[390px] overflow-hidden rounded-[22px] border border-[#FBBF24]/35 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl duration-200">
      <div className="border-b border-[#F59E0B]/25 bg-[linear-gradient(135deg,#FDE68A_0%,#FBBF24_55%,#F59E0B_100%)] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7C2D12] backdrop-blur-sm">
              <Sparkles size={10} />
              Notification Center
            </div>

            <h3 className="text-[22px] font-extrabold tracking-tight text-slate-900">
              Notifications
            </h3>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
              {unreadCount} unread
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManageSettings ? (
              <button
                type="button"
                title="Notification settings"
                aria-label="Notification settings"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenSettings?.();
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/50 bg-white/90 text-[#B45309] shadow-[0_6px_16px_rgba(255,255,255,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[#92400E] hover:shadow-[0_10px_24px_rgba(255,255,255,0.38)]"
              >
                <Settings size={16} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="rounded-xl border border-white/50 bg-white/90 px-3.5 py-2 text-[11px] font-bold text-[#B45309] shadow-[0_6px_16px_rgba(255,255,255,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[#92400E] hover:shadow-[0_10px_24px_rgba(255,255,255,0.38)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              Mark all read
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="px-5 py-10 text-center text-sm font-medium text-slate-500">
          Loading notifications...
        </div>
      ) : (
        <div className="max-h-[460px] overflow-y-auto bg-white">
          <NotificationList
            items={items}
            onRead={onRead}
            onDelete={onDelete}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
}