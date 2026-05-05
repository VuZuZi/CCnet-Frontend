import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Wallet,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/components/ui/Button/Button';
import { getRoleLabel } from '@/shared/lib/roleLabels';

function Avatar({ user, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';
  const initials = user?.fullName?.substring(0, 2).toUpperCase() || 'U';

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt="Ảnh đại diện"
        className={cn(
          sizeClass,
          'rounded-full border-2 border-white bg-slate-100 object-cover shadow-sm'
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'flex items-center justify-center rounded-full border-2 border-white bg-amber-100 text-sm font-bold text-amber-700 shadow-sm'
      )}
    >
      {initials}
    </div>
  );
}

export function NavbarUserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const panelRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);

  const normalizedRole = String(user?.role || '').toLowerCase();
  const isOrganizer = normalizedRole === 'organizer';

  const updateAnchorRect = () => {
    if (!anchorRef.current) return;
    setAnchorRect(anchorRef.current.getBoundingClientRect());
  };

  const handleToggle = () => {
    updateAnchorRect();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    updateAnchorRect();

    const handleViewportChange = () => {
      updateAnchorRect();
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleMouseDown = (event) => {
      const target = event.target;
      const clickedAnchor = anchorRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);

      if (!clickedAnchor && !clickedPanel) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen]);

  const panelStyle = useMemo(() => {
    if (!anchorRect) return undefined;

    return {
      position: 'fixed',
      top: anchorRect.bottom + 12,
      right: Math.max(16, window.innerWidth - anchorRect.right),
      zIndex: 5000,
    };
  }, [anchorRect]);

  return (
    <>
      <div className="relative ml-2" ref={anchorRef}>
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label="Menu tài khoản"
        >
          <Avatar user={user} size="sm" />
        </button>
      </div>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Đóng menu người dùng"
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[4990] cursor-default bg-transparent"
              />

              <div
                ref={panelRef}
                style={panelStyle}
                className="animate-in fade-in slide-in-from-top-2 w-72 rounded-xl border border-slate-100 bg-white py-2 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
              >
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setIsOpen(false)}
                  className="flex min-w-0 items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <Avatar user={user} size="md" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-900">
                      {user?.fullName || 'Người dùng'}
                    </span>
                    <span className="block truncate text-xs font-medium capitalize text-slate-500">
                      {getRoleLabel(user?.role, 'Nhà tài trợ')}
                    </span>
                  </span>
                </Link>

                <div className="mx-4 my-1 h-px bg-slate-100" />

                <Link
                  to={`${ROUTES.PROFILE}?view=wallet`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Wallet size={16} /> Ví, giao dịch & ủng hộ
                </Link>

                <div className="mx-4 my-1 h-px bg-slate-100" />

                <Link
                  to={isOrganizer ? ROUTES.WORKSPACE : ROUTES.DASHBOARD}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <LayoutDashboard size={16} />
                  {isOrganizer
                    ? 'Không gian làm việc của bạn'
                    : 'Bảng điều khiển'}
                </Link>

                <div className="mx-4 my-1 h-px bg-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            </>,
            document.body
          )
        : null}
    </>
  );
}

export default NavbarUserDropdown;
