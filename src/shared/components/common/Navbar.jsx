import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MessageCircle,
  Bell,
  ChevronDown,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { ROUTES } from '@/shared/constants/routes';
import { Button, cn } from '@/shared/components/ui/Button/Button';
import ChatWidget from '@/features/chat/components/ChatWidget';
import { CCNetLogo } from '@/shared/components/ui/Logo/CCNetLogo';
import GlobalSearch from '@/features/search/components/GlobalSearch';
import { LanguageSwitcher } from '@/i18n/components/LanguageSwitcher';

const NAV_LINKS = [
  { label: 'navigation.projects', to: ROUTES.PROJECTS },
  { label: 'navigation.community', to: ROUTES.COMMUNITY || '/community' },
  { label: 'navigation.need_help', to: '/need-help' },
];

export function Navbar() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4 lg:gap-8">
          <div className="flex items-center gap-8">
            <Link
              to={ROUTES.HOME}
              className="group flex flex-shrink-0 items-center gap-2 outline-none"
            >
              <div className="transition-transform group-hover:scale-105">
                <CCNetLogo className="h-10 w-10" />
              </div>
              <span className="hidden text-xl font-bold tracking-tight text-slate-900 sm:block">
                CCNet
              </span>
            </Link>

            <div className="hidden items-center gap-6 text-sm font-medium lg:flex">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname.startsWith(link.to);

                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={cn(
                      'transition-colors whitespace-nowrap',
                      isActive
                        ? 'font-bold text-amber-500'
                        : 'text-slate-600 hover:text-amber-500'
                    )}
                  >
                    {t(link.label)}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mx-auto hidden flex-1 justify-center md:flex">
            <GlobalSearch />
          </div>

          <div className="flex flex-shrink-0 items-center space-x-2 sm:space-x-4">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            {isAuthenticated ? (
              <>
                <ChatAction />
                <NotificationAction />

                <button className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 md:hidden">
                  <Search size={24} />
                </button>

                <div className="hidden border-l border-slate-200 pl-2 sm:block">
                  <UserDropdown user={user} onLogout={logout} />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to={ROUTES.LOGIN}
                  className="hidden whitespace-nowrap font-medium text-slate-600 hover:text-slate-900 sm:block"
                >
                  {t('navigation.login')}
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm" className="!rounded-xl">
                    {t('navigation.register')}
                  </Button>
                </Link>
              </div>
            )}

            <button
              className="ml-2 p-2 text-slate-600 hover:text-slate-900 focus:outline-none lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 absolute left-0 top-20 flex w-full flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden">
          <div className="md:hidden">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                className="w-full rounded-lg bg-slate-100 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder={`${t('common.search')}...`}
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
                  {t(link.label)}
                </Link>
              );
            })}
          </div>

          <div className="border-b border-slate-100 pb-4">
            <LanguageSwitcher className="w-full" />
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
                    {user?.role || 'User'}
                  </p>
                </div>
              </div>

              <Link
                to={ROUTES.PROFILE}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-50"
              >
                <UserIcon size={18} /> {t('navigation.profile')}
              </Link>

              <Link
                to={ROUTES.DASHBOARD}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard size={18} /> {t('navigation.dashboard')}
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-left text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} /> {t('navigation.logout')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to={ROUTES.LOGIN}
                className="w-full rounded-lg bg-slate-100 py-2 text-center font-medium text-slate-700"
              >
                {t('navigation.login')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function ChatAction() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
      >
        <MessageCircle size={24} />
        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
      </button>
      <ChatWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

function NotificationAction() {
  return (
    <button className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100">
      <Bell size={24} />
      <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
    </button>
  );
}

function UserDropdown({ user, onLogout }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative ml-2" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
      >
        <Avatar user={user} size="sm" />
        <div className="hidden text-left leading-tight lg:block">
          <span className="block text-sm font-bold text-slate-900">
            {user?.fullName || 'Alex Doe'}
          </span>
          <span className="block text-xs capitalize text-slate-500">
            {user?.role || 'Impact Donor'}
          </span>
        </div>
        <ChevronDown className="hidden text-slate-400 lg:block" size={16} />
      </div>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-4 w-56 rounded-xl border border-slate-100 bg-white py-2 shadow-lg">
          <Link
            to={ROUTES.PROFILE}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <UserIcon size={16} /> {t('navigation.profile')}
          </Link>

          <Link
            to={ROUTES.DASHBOARD}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <LayoutDashboard size={16} /> {t('navigation.dashboard')}
          </Link>

          <div className="mx-4 my-1 h-px bg-slate-100" />

          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={16} /> {t('navigation.logout')}
          </button>
        </div>
      )}
    </div>
  );
}

function Avatar({ user, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';
  const initials = user?.fullName?.substring(0, 2).toUpperCase() || 'U';

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt="Avatar"
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