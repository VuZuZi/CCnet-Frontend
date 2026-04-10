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
  Bell,
} from "lucide-react";
import {
  useAuthStore,
  authSelectors,
} from "@/features/auth/stores/useAuthStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { LanguageSwitcher } from "@/i18n/components/LanguageSwitcher";
import NavbarNotificationAction from "@/features/notification/components/NavbarNotificationAction";
import NotificationStreamBootstrap from "@/features/notification/components/NotificationStreamBootstrap";

const MENU_ITEMS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  {
    path: "/admin/notifications",
    label: "Notifications",
    icon: Bell,
    end: false,
  },
  {
    path: "/admin/users",
    label: "User Management",
    icon: Users,
    end: false,
  },
  {
    path: "/admin/organizers",
    label: "Organizer Requests",
    icon: ShieldCheck,
    end: false,
  },
  {
    path: "/admin/need-help",
    label: "NeedHelp Requests",
    icon: HeartHandshake,
    end: false,
  },
  { path: "/admin/projects", label: "Projects", icon: Rocket, end: false },
  { path: "/admin/reports", label: "Reports & Logs", icon: Flag, end: false },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();

  const handleLogout = () => {
    if (
      window.confirm(
        t("common.confirm_logout") || "Bạn có chắc chắn muốn đăng xuất?",
      )
    ) {
      logout();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <NotificationStreamBootstrap />

      <aside
        className={`z-20 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-20 items-center justify-center gap-3 border-b border-slate-100 px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-slate-900 shadow-sm">
            <Rocket size={20} strokeWidth={2.5} />
          </div>
          {isSidebarOpen && (
            <span className="truncate text-xl font-extrabold tracking-tight">
              CCNet Admin
            </span>
          )}
        </div>

        <nav className="mt-6 flex-1 space-y-2 overflow-y-auto px-3">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                    isActive
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                      : "text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                {isSidebarOpen && (
                  <span className="truncate font-semibold">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 font-semibold text-red-500 transition-all hover:bg-red-50"
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span>{t("navigation.logout")}</span>}
          </button>
        </div>
      </aside>

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-6">
            <NavbarNotificationAction />
            <LanguageSwitcher />

            <button
              onClick={handleLogout}
              className="group flex items-center gap-4 rounded-xl p-1.5 transition-colors hover:bg-slate-50"
              title={t("navigation.logout")}
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-red-600">
                  {user?.fullName || "System Admin"}
                </p>
                <p className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                  Online
                </p>
              </div>

              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full border-2 border-slate-100 object-cover transition-colors group-hover:border-red-200"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 font-bold text-slate-600 shadow-sm transition-colors group-hover:bg-red-50 group-hover:text-red-600">
                    {user?.fullName?.substring(0, 2).toUpperCase() || "AD"}
                  </div>
                )}

                <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  <LogOut size={12} className="text-red-500" />
                </div>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;