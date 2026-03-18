import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Bell, ChevronDown, Menu, X, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { ROUTES } from '@/shared/constants/routes';
import { Button, cn } from '@/shared/components/ui/Button/Button';
import ChatWidget from '@/features/chat/components/ChatWidget';
import { CCNetLogo } from '@/shared/components/ui/Logo/CCNetLogo';

const NAV_LINKS = [
  { label: 'Project', to: ROUTES.PROJECTS },
  { label: 'Community', to: ROUTES.COMMUNITY || '/community' },
  { label: 'NeedHelp', to: '/need-help' },
];

export function Navbar() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4 lg:gap-8">

          <div className="flex items-center gap-8">
            <Link to={ROUTES.HOME} className="flex-shrink-0 flex items-center gap-2 outline-none group">
              <div className="group-hover:scale-105 transition-transform">
                <CCNetLogo className="w-10 h-10" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block text-slate-900">CCNet</span>
            </Link>

            <div className="hidden lg:flex items-center gap-6 font-medium text-sm">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-amber-500 font-bold" : "text-slate-600 hover:text-amber-500"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden md:block mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-inner"
                placeholder="Search projects, non-profits, or impact stories..."
              />
            </form>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <ChatAction />
                <NotificationAction />

                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 md:hidden transition-colors">
                  <Search size={24} />
                </button>

                <div className="pl-2 border-l border-slate-200 hidden sm:block">
                  <UserDropdown user={user} onLogout={logout} />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to={ROUTES.LOGIN} className="hidden sm:block font-medium text-slate-600 hover:text-slate-900">Log in</Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm" className="!rounded-xl">Get Started</Button>
                </Link>
              </div>
            )}

            <button
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <div className="md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Search..."
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
                    "font-medium py-2 px-2 rounded-lg transition-colors",
                    isActive ? "bg-amber-50 text-amber-600" : "text-slate-700 hover:bg-slate-50 hover:text-amber-500"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-3 px-2 mb-4">
                <Avatar user={user} size="md" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
              <Link to={ROUTES.PROFILE} className="flex items-center gap-3 py-2 px-2 text-slate-700 hover:bg-slate-50 rounded-lg">
                <UserIcon size={18} /> Profile
              </Link>
              <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 py-2 px-2 text-slate-700 hover:bg-slate-50 rounded-lg">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <button onClick={logout} className="flex items-center gap-3 py-2 px-2 text-red-600 hover:bg-red-50 rounded-lg text-left">
                <LogOut size={18} /> Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link to={ROUTES.LOGIN} className="w-full text-center py-2 font-medium text-slate-700 bg-slate-100 rounded-lg">Log in</Link>
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
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative transition-colors">
        <MessageCircle size={24} />
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <ChatWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

function NotificationAction() {
  return (
    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative transition-colors">
      <Bell size={24} />
      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
    </button>
  );
}

function UserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative ml-2" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Avatar user={user} size="sm" />
        <div className="hidden lg:block text-left leading-tight">
          <span className="block text-sm font-bold text-slate-900">{user?.fullName || 'Alex Doe'}</span>
          <span className="block text-xs text-slate-500 capitalize">{user?.role || 'Impact Donor'}</span>
        </div>
        <ChevronDown className="text-slate-400 hidden lg:block" size={16} />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <Link to={ROUTES.PROFILE} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <UserIcon size={16} /> Profile
          </Link>
          <Link to={ROUTES.DASHBOARD} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <div className="h-px bg-slate-100 my-1 mx-4"></div>
          <button onClick={() => { setIsOpen(false); onLogout(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Avatar({ user, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
  const initials = user?.fullName?.substring(0, 2).toUpperCase() || 'U';

  if (user?.avatar) {
    return <img src={user.avatar} alt="Avatar" className={cn(sizeClass, "rounded-full border-2 border-white shadow-sm object-cover bg-slate-100")} />;
  }
  return (
    <div className={cn(sizeClass, "bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-700 border-2 border-white shadow-sm")}>
      {initials}
    </div>
  );
}