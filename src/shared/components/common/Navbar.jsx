import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button';
import GlobalSearch from '@/features/search/components/GlobalSearch';

export function Navbar() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();
  const location = useLocation();
  
  // State quản lý menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Features', to: ROUTES.FEATURES },
    ...(isAuthenticated ? [{ label: 'Following', to: ROUTES.FOLLOWING }] : []),
    { label: 'Pricing', to: ROUTES.PRICING },
    { label: 'About', to: ROUTES.ABOUT },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-light-gray shadow-sm h-[72px] flex items-center">
      {/* Container giới hạn max width 1200px */}
      <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center justify-between">
        
        {/* Brand Logo */}
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

        {/* Global Search (Ẩn trên mobile, hiện trên md trở lên) */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <GlobalSearch />
        </div>

        {/* Hamburger Button (Chỉ hiện trên Mobile/Tablet) */}
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

        {/* Desktop Navigation */}
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

          <div className="ml-2">
            {isAuthenticated ? (
              <AuthenticatedNav user={user} onLogout={logout} />
            ) : (
              <UnauthenticatedNav />
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-white border-b border-light-gray shadow-md lg:hidden flex flex-col p-4 gap-4 animate-fade-in-up">
          {/* Mang cục Search xuống Mobile Menu */}
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

// Component Dropdown User
function AuthenticatedNav({ user, onLogout, isMobile }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getInitials = (name) => name?.substring(0, 2).toUpperCase() || 'U';

  // Lắng nghe sự kiện click ra ngoài để đóng dropdown
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
        {/* Ẩn tên trên màn hình nhỏ, hiện trên màn lớn hoặc khi ở chế độ mobile menu */}
        <span className={`text-sm font-semibold ${isMobile ? 'inline' : 'hidden md:inline'}`}>
          {user.fullName}
        </span>
      </button>

      {/* Box Menu */}
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

// Component Auth Buttons
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