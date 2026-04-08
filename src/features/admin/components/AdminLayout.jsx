
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  Rocket,
  Flag,
  LogOut,
  Menu,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import {
  useAuthStore,
  authSelectors,
} from "@/features/auth/stores/useAuthStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { LanguageSwitcher } from "@/i18n/components/LanguageSwitcher";

const MENU_ITEMS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/admin/users", label: "User Management", icon: Users, end: false },
  { path: "/admin/organizers", label: "Organizer Requests", icon: ShieldCheck, end: false },
  { path: "/admin/need-help", label: "NeedHelp Requests", icon: HeartHandshake, end: false },
  { path: "/admin/projects", label: "Projects", icon: Rocket, end: false },
  { path: "/admin/reports", label: "Reports & Logs", icon: Flag, end: false },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();

  const handleLogout = () => {
    if (window.confirm(t('common.confirm_logout') || 'Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside
        className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20 ${isSidebarOpen ? "w-64" : "w-20"
          }`}
      >
        <div className="h-20 flex items-center justify-center border-b border-slate-100 px-4 gap-3">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-slate-900 shadow-sm shrink-0">
            <Rocket size={20} strokeWidth={2.5} />
          </div>
          {isSidebarOpen && (
            <span className="font-extrabold text-xl tracking-tight truncate">
              CCNet Admin
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-6 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                {isSidebarOpen && (
                  <span className="font-semibold truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold"
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span>{t('navigation.logout')}</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 hover:bg-slate-50 p-1.5 rounded-xl transition-colors group"
              title={t('navigation.logout')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                  {user?.fullName || "System Admin"}
                </p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                  Online
                </p>
              </div>
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover border-2 border-slate-100 group-hover:border-red-200 transition-colors"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                    {user?.fullName?.substring(0, 2).toUpperCase() || "AD"}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <LogOut size={12} className="text-red-500" />
                </div>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
