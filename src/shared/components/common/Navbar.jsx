import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button';
import GlobalSearch from '@/features/search/components/GlobalSearch';
import ChatWidget from '@/features/chat/components/ChatWidget';

export function Navbar() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsChatOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Features', to: ROUTES.FEATURES },
    ...(isAuthenticated ? [{ label: 'Following', to: ROUTES.FOLLOWING }] : []),
    { label: 'Pricing', to: ROUTES.PRICING },
    { label: 'About', to: ROUTES.ABOUT },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-light-gray shadow-sm h-[72px] flex items-center">
      <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 no-underline">
          <div className="w-11 h-11 bg-yellow rounded-sm flex items-center justify-center text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="10" height="10" fill="currentColor" />
              <rect y="14" width="10" height="10" fill="currentColor" />
              <rect x="14" width="10" height="10" fill="currentColor" />
              <rect x="14" y="14" width="10" height="10" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold text-xl text-black">CCNet</span>
        </Link>

        <div className="hidden md:block flex-1 max-w-md mx-4">
          <GlobalSearch />
        </div>

        <button
          className="lg:hidden p-2 text-black focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((nav) => (
            <Link
              key={nav.label}
              to={nav.to}
              className="text-black font-medium hover:text-orange transition-colors duration-200 no-underline"
            >
              {nav.label}
            </Link>
          ))}

          {isAuthenticated && (
            <div className="relative" ref={chatRef}>
              <button
                type="button"
                onClick={() => setIsChatOpen((prev) => !prev)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-light-gray text-black transition-colors hover:bg-gray-200"
                aria-label="Open chat"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 11.5C20 16.1944 16.1944 20 11.5 20C10.0571 20 8.69817 19.6404 7.50739 19.0057L4 20L4.99431 16.4926C4.35962 15.3018 4 13.9429 4 12.5C4 7.80558 7.80558 4 12.5 4C17.1944 4 21 7.80558 21 12.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
          )}

          <div className="ml-2">
            {isAuthenticated ? (
              <AuthenticatedNav user={user} onLogout={logout} />
            ) : (
              <UnauthenticatedNav />
            )}
          </div>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-white border-b border-light-gray shadow-md lg:hidden flex flex-col p-4 gap-4 animate-fade-in-up">
          <div className="md:hidden">
            <GlobalSearch />
          </div>

          <div className="flex flex-col gap-3">
            {navItems.map((nav) => (
              <Link
                key={nav.label}
                to={nav.to}
                className="text-black font-medium py-2 border-b border-light-gray hover:text-orange no-underline"
              >
                {nav.label}
              </Link>
            ))}
          </div>

          <div className="pt-2">
            {isAuthenticated ? (
              <AuthenticatedNav user={user} onLogout={logout} isMobile />
            ) : (
              <UnauthenticatedNav isMobile />
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function AuthenticatedNav({ user, onLogout, isMobile }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getInitials = (name) => name?.substring(0, 2).toUpperCase() || 'U';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-light-gray px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer border-none"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.fullName} className="w-8 h-8 object-cover rounded-full" />
        ) : (
          <div className="w-8 h-8 bg-yellow rounded-full flex items-center justify-center text-sm font-bold text-black">
            {getInitials(user.fullName)}
          </div>
        )}
        <span className={`text-sm font-semibold ${isMobile ? 'inline' : 'hidden md:inline'}`}>
          {user.fullName}
        </span>
      </button>

      {isOpen && (
        <div
          className={`
            bg-white rounded-md shadow-lg border border-light-gray py-2 z-50
            ${isMobile ? 'mt-3 w-full relative' : 'mt-2 absolute right-0 w-48'}
          `}
        >
          <Link
            to={ROUTES.PROFILE}
            className="block px-4 py-2 text-sm text-black hover:bg-light-gray no-underline"
            onClick={() => setIsOpen(false)}
          >
            👤 Profile
          </Link>
          <Link
            to={ROUTES.DASHBOARD}
            className="block px-4 py-2 text-sm text-black hover:bg-light-gray no-underline"
            onClick={() => setIsOpen(false)}
          >
            📊 Dashboard
          </Link>
          <div className="h-[1px] bg-light-gray my-1 w-full"></div>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-light-gray border-none bg-transparent cursor-pointer"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

function UnauthenticatedNav({ isMobile }) {
  return (
    <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'items-center'}`}>
      <Link to={ROUTES.LOGIN} className={isMobile ? 'w-full' : ''}>
        <Button variant="outlineDark" className={`!py-2 !px-4 ${isMobile ? 'w-full' : ''}`}>
          Login
        </Button>
      </Link>

      <Link to={ROUTES.REGISTER} className={isMobile ? 'w-full' : ''}>
        <Button variant="yellow" className={`!py-2 !px-4 ${isMobile ? 'w-full' : ''}`}>
          Get Started
        </Button>
      </Link>
    </div>
  );
}