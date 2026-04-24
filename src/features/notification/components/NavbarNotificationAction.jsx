import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationBadge from './NotificationBadge';
import NotificationDropdown from './NotificationDropdown';
import NotificationSettingsModal from './NotificationSettingsModal';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadNotificationCount } from '../hooks/useUnreadNotificationCount';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { getNavbarFloatingPanelMetrics } from '@/shared/lib/navbarFloatingPanel';
import { useNavbarFloatingPanelStore } from '@/shared/stores/useNavbarFloatingPanelStore';

export default function NavbarNotificationAction() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const anchorRef = useRef(null);
  const panelRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const activePanel = useNavbarFloatingPanelStore((state) => state.activePanel);
  const togglePanel = useNavbarFloatingPanelStore((state) => state.togglePanel);
  const closePanel = useNavbarFloatingPanelStore((state) => state.closePanel);
  const isDropdownOpen = activePanel === 'notification';

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

  const updateAnchorRect = () => {
    if (!anchorRef.current) return;
    setAnchorRect(anchorRef.current.getBoundingClientRect());
  };

  const closeSettingsOnly = () => {
    setIsSettingsOpen(false);
  };

  const handleBellClick = () => {
    setIsSettingsOpen(false);
    updateAnchorRect();
    togglePanel('notification');
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  useEffect(() => {
    if (!isDropdownOpen) return undefined;

    updateAnchorRect();

    const handleViewportChange = () => {
      updateAnchorRect();
    };

    const handleMouseDown = (event) => {
      const target = event.target;
      const clickedAnchor = anchorRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);

      if (!clickedAnchor && !clickedPanel) {
        closePanel();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        closePanel();
      }
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen, isSettingsOpen, closePanel]);

  const portalWrapperStyle = useMemo(() => {
    const metrics = getNavbarFloatingPanelMetrics(anchorRect, { width: 408 });

    return {
      position: 'fixed',
      top: metrics.top,
      right: metrics.right,
      zIndex: 6000,
      width: metrics.width,
      maxWidth: metrics.maxWidth,
    };
  }, [anchorRect]);

  return (
    <>
      <div className="relative" ref={anchorRef}>
        <button
          type="button"
          onClick={handleBellClick}
          className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${buttonClasses}`}
          aria-label={isDropdownOpen ? 'Đóng thông báo' : 'Mở thông báo'}
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
      </div>

      {isDropdownOpen && typeof document !== 'undefined'
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Đóng thông báo"
                onClick={closePanel}
                className="fixed inset-0 z-[5990] cursor-default bg-transparent"
              />

              <div
                ref={panelRef}
                style={portalWrapperStyle}
                className="z-[6000]"
              >
                <div className="relative z-[6000]">
                  <NotificationDropdown
                    isOpen={isDropdownOpen}
                    items={items}
                    unreadCount={unreadCount}
                    isLoading={notificationsQuery.isLoading}
                    onClose={closePanel}
                    onOpenSettings={handleOpenSettings}
                    onMarkAllRead={() => markAllAsRead.mutate()}
                    onRead={(id) => markAsRead.mutate(id)}
                    onDelete={(id) => deleteNotification.mutate(id)}
                  />
                </div>
              </div>
            </>,
            document.body
          )
        : null}

      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettingsOnly}
        onBackdropClose={closeSettingsOnly}
      />
    </>
  );
}
