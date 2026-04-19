import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  HeartHandshake,
} from 'lucide-react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { ROUTES } from '@/shared/constants/routes';
import { Button, cn } from '@/shared/components/ui/Button/Button';
import { CCNetLogo } from '@/shared/components/ui/Logo/CCNetLogo';
import GlobalSearch from '@/features/search/components/GlobalSearch';
import { useOrganizerAssignedRequests } from '@/features/needHelp/hooks/useHelpRequestQueries';
import NavbarChatAction from './navbar/NavbarChatAction';
import NavbarUserDropdown from './navbar/NavbarUserDropdown';
import NavbarNotificationAction from '@/features/notification/components/NavbarNotificationAction';

const NAV_LINKS = [
  { label: 'Dự án', to: ROUTES.PROJECTS },
  { label: 'Cộng đồng', to: ROUTES.COMMUNITY || '/community' },
  { label: 'Cần hỗ trợ', to: '/need-help' },
];

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

export function Navbar() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();
  const location = useLocation();
  const normalizedRole = String(user?.role || '').toLowerCase();
  const isOrganizer = normalizedRole === 'organizer';
  const userMainRoute = isOrganizer ? ROUTES.WORKSPACE : ROUTES.DASHBOARD;
  const userMainLabel =
    isOrganizer ? 'Không gian làm việc của bạn' : 'Bảng điều khiển';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isMessagesPage = location.pathname.startsWith('/messages');

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-[3000] w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="w-full px-6 sm:px-8 lg:px-10 xl:px-12">
        <div className="grid h-20 grid-cols-[auto_minmax(320px,1fr)_auto] items-center gap-8 lg:gap-10 overflow-visible">
          <div className="flex min-w-0 items-center gap-10 overflow-visible">
            <Link
              to={ROUTES.HOME}
              className="group flex flex-shrink-0 items-center gap-3 outline-none"
            >
              <div className="transition-transform group-hover:scale-105">
                <CCNetLogo className="h-10 w-10" />
              </div>
              <span className="hidden text-[20px] font-bold tracking-tight text-slate-900 sm:block">
                CCNet
              </span>
            </Link>

            <div className="hidden items-center gap-10 text-[15px] font-medium lg:flex">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname.startsWith(link.to);

                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={cn(
                      'transition-colors',
                      isActive
                        ? 'font-bold text-amber-500'
                        : 'text-slate-600 hover:text-amber-500'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden w-full justify-center md:flex">
            <div className="w-full max-w-[420px] lg:max-w-[520px]">
              <GlobalSearch />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 overflow-visible sm:gap-4 lg:gap-5">
            {isAuthenticated ? (
              <>
                <OrganizerNeedHelpAction user={user} />

                {!isMessagesPage ? (
                  <NavbarChatAction hideWidget={false} />
                ) : null}

                <NavbarNotificationAction isAuthenticated={isAuthenticated} />

                <button className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 md:hidden">
                  <Search size={24} />
                </button>

                <div className="hidden border-l border-slate-200 pl-4 sm:block overflow-visible">
                  <NavbarUserDropdown user={user} onLogout={logout} />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to={ROUTES.LOGIN}
                  className="hidden font-medium text-slate-600 hover:text-slate-900 sm:block"
                >
                  Đăng nhập
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm" className="!rounded-xl">
                    Bắt đầu ngay
                  </Button>
                </Link>
              </div>
            )}

            <button
              className="ml-1 p-2 text-slate-600 hover:text-slate-900 focus:outline-none lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 absolute left-0 top-20 z-[3100] flex w-full flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden">
          <div className="md:hidden">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                className="w-full rounded-lg bg-slate-100 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Tìm kiếm..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={cn(
                    'rounded-lg px-2 py-2 font-medium transition-colors',
                    isActive
                      ? 'bg-amber-50 text-amber-600'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-amber-500'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-2">
              <div className="mb-4 flex items-center gap-3 px-2">
                <Avatar user={user} size="md" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {user?.fullName}
                  </p>
                  <p className="text-xs capitalize text-slate-500">
                    {user?.role || 'Người dùng'}
                  </p>
                </div>
              </div>

              <Link
                to={ROUTES.PROFILE}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-50"
              >
                <UserIcon size={18} /> Hồ sơ
              </Link>

              <Link
                to={userMainRoute}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard size={18} /> {userMainLabel}
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-left text-red-600 hover:bg-red-50"
                type="button"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to={ROUTES.LOGIN}
                className="w-full rounded-lg bg-slate-100 py-2 text-center font-medium text-slate-700"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function OrganizerNeedHelpAction({ user }) {
  const role = user?.role?.toString().toLowerCase();
  const isOrganizer = role === 'organizer';
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const panelRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);

  const { data, refetch } = useOrganizerAssignedRequests(
    { status: 'VERIFIED', limit: 6, sortBy: 'assignedAt' },
    isOrganizer
  );

  const updateAnchorRect = () => {
    if (!anchorRef.current) return;
    setAnchorRect(anchorRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (isOpen && isOrganizer) {
      refetch();
      updateAnchorRect();
    }
  }, [isOpen, isOrganizer, refetch]);

  useEffect(() => {
    if (!isOrganizer) return undefined;

    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [isOrganizer, refetch]);

  useEffect(() => {
    if (!isOpen) return undefined;

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

  if (!isOrganizer) return null;

  const suggestedItems = data?.data || [];
  const hasItems = suggestedItems.length > 0;

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
      <div className="relative" ref={anchorRef}>
        <button
          onClick={() => {
            updateAnchorRect();
            setIsOpen((prev) => !prev);
          }}
          className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
            hasItems
              ? 'border-[#FBBF24] bg-[#FFFBEB] text-[#F59E0B] shadow-md shadow-[#FBBF24]/15'
              : 'border-slate-200 bg-white text-[#F59E0B] shadow-sm'
          }`}
          title="Các yêu cầu Cần hỗ trợ được gợi ý"
          aria-label="Các yêu cầu Cần hỗ trợ được gợi ý"
          aria-expanded={isOpen}
          type="button"
        >
          <HeartHandshake
            size={20}
            className={`transition-transform duration-200 ${
              isOpen
                ? 'scale-110 text-[#F59E0B]'
                : 'text-[#F59E0B] group-hover:scale-110'
            }`}
          />

          {hasItems ? (
            <span className="absolute -right-1 -top-1 flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-white bg-[#F59E0B] px-1 text-[10px] font-bold leading-none text-white shadow-sm">
              {suggestedItems.length > 99 ? '99+' : suggestedItems.length}
            </span>
          ) : null}
        </button>
      </div>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Đóng gợi ý NeedHelp"
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[4990] cursor-default bg-transparent"
              />

              <div
                ref={panelRef}
                style={panelStyle}
                className="w-80 rounded-xl border border-slate-100 bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
              >
                <div className="mb-2 px-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Gợi ý từ quản trị viên
                  </p>
                  <p className="text-xs text-slate-500">
                    Mở và phản hồi các yêu cầu Cần hỗ trợ đã được phân công.
                  </p>
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {suggestedItems.length ? (
                    suggestedItems.map((item) => (
                      <Link
                        key={item._id}
                        to={`/need-help/${item._id}`}
                        onClick={() => setIsOpen(false)}
                        className="block rounded-lg border border-slate-200 p-2.5 transition hover:bg-slate-50"
                      >
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {item.location?.address || 'Chưa có địa điểm'}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                      Hiện chưa có yêu cầu nào được gợi ý.
                    </div>
                  )}
                </div>

                <Link
                  to="/organizer/need-help"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 block rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Xem tất cả phân công
                </Link>
              </div>
            </>,
            document.body
          )
        : null}
    </>
  );
}

export default Navbar;