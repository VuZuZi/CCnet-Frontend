import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationBadge from './NotificationBadge';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadNotificationCount } from '../hooks/useUnreadNotificationCount';
import { useNotificationActions } from '../hooks/useNotificationActions';

export default function NavbarNotificationAction() {
  const [isOpen, setIsOpen] = useState(false);

  const notificationsQuery = useNotifications({ page: 1, limit: 20 });
  const unreadCountQuery = useUnreadNotificationCount();
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationActions();

  const items = notificationsQuery.data?.items || [];
  const unreadCount = unreadCountQuery.data || 0;
  const hasUnread = unreadCount > 0;

  const buttonClasses = useMemo(() => {
    return hasUnread
      ? 'border-[#FBBF24] bg-[#FFFBEB] text-[#F59E0B] shadow-md shadow-[#FBBF24]/15'
      : 'border-slate-200 bg-white text-[#F59E0B] shadow-sm';
  }, [hasUnread]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${buttonClasses}`}
        aria-label="Open notifications"
      >
        <Bell
          size={20}
          className={`transition-transform duration-200 ${isOpen ? 'scale-110 text-[#F59E0B]' : 'group-hover:scale-110 text-[#F59E0B]'}`}
        />
        <NotificationBadge count={unreadCount} />
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        items={items}
        unreadCount={unreadCount}
        isLoading={notificationsQuery.isLoading}
        onClose={() => setIsOpen(false)}
        onMarkAllRead={() => markAllAsRead.mutate()}
        onRead={(id) => markAsRead.mutate(id)}
        onDelete={(id) => deleteNotification.mutate(id)}
      />
    </div>
  );
}