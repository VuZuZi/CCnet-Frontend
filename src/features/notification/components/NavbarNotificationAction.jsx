import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationBadge from './NotificationBadge';
import NotificationDropdown from './NotificationDropdown';
import NotificationSettingsModal from './NotificationSettingsModal';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadNotificationCount } from '../hooks/useUnreadNotificationCount';
import { useNotificationActions } from '../hooks/useNotificationActions';

export default function NavbarNotificationAction() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const wrapperRef = useRef(null);

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

  const closeSettingsOnly = () => {
    setIsSettingsOpen(false);
  };

  const handleBellClick = () => {
    setIsSettingsOpen(false);
    setIsDropdownOpen((previous) => !previous);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSettingsOpen) return;

      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSettingsOpen]);

  return (
    <>
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={handleBellClick}
          className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${buttonClasses}`}
          aria-label={isDropdownOpen ? 'Close notifications' : 'Open notifications'}
          aria-expanded={isDropdownOpen}
        >
          <Bell
            size={20}
            className={`transition-transform duration-200 ${
              isDropdownOpen
                ? 'scale-110 text-[#F59E0B]'
                : 'group-hover:scale-110 text-[#F59E0B]'
            }`}
          />
          <NotificationBadge count={unreadCount} />
        </button>

        <NotificationDropdown
          isOpen={isDropdownOpen}
          items={items}
          unreadCount={unreadCount}
          isLoading={notificationsQuery.isLoading}
          onClose={() => setIsDropdownOpen(false)}
          onOpenSettings={handleOpenSettings}
          onMarkAllRead={() => markAllAsRead.mutate()}
          onRead={(id) => markAsRead.mutate(id)}
          onDelete={(id) => deleteNotification.mutate(id)}
        />
      </div>

      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettingsOnly}
        onBackdropClose={closeSettingsOnly}
      />
    </>
  );
}