import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/components/ui/Button/Button';

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
  const ref = useRef(null);
  const normalizedRole = String(user?.role || '').toLowerCase();
  const isOrganizer = normalizedRole === 'organizer';

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
            {user?.role || 'Nhà tài trợ'}
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
            <UserIcon size={16} /> Hồ sơ
          </Link>

          <Link
            to={isOrganizer ? ROUTES.WORKSPACE : ROUTES.DASHBOARD}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <LayoutDashboard size={16} /> {isOrganizer ? 'Không gian làm việc của bạn' : 'Bảng điều khiển'}
          </Link>

          <Link
            to={`${ROUTES.PROFILE}?view=wallet`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Wallet size={16} /> Ví, giao dịch & ủng hộ
          </Link>

          <div className="mx-4 my-1 h-px bg-slate-100" />

          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            type="button"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default NavbarUserDropdown;