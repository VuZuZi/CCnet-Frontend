import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, Search, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import {
  useAuthStore,
  authSelectors,
} from "@/features/auth/stores/useAuthStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { LanguageSwitcher } from "@/i18n/components/LanguageSwitcher";
import NavbarNotificationAction from "@/features/notification/components/NavbarNotificationAction";
import NotificationStreamBootstrap from "@/features/notification/components/NotificationStreamBootstrap";
import Sidebar from "./Sidebar";

export function AdminLayout() {
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();

  const handleLogout = () => {
    if (
      window.confirm(
        t("Are you sure you want to log out?") ||
          "Are you sure you want to log out?"
      )
    ) {
      logout();
    }
  };

  const displayName = user?.fullName || "System Admin";
  const initials = displayName
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <NotificationStreamBootstrap />

      <Sidebar
        isOpen={isSidebarOpen}
        onLogout={handleLogout}
        logoutLabel={t("Logout") || "Logout"}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-amber-300 hover:text-amber-700"
                aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose size={18} strokeWidth={2.3} />
                ) : (
                  <PanelLeftOpen size={18} strokeWidth={2.3} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden xl:block">
                <Search
                  size={18}
                  strokeWidth={2.2}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="Search modules, actions, logs..."
                  className="h-11 w-[300px] rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                />
              </div>

              <NavbarNotificationAction />
              <LanguageSwitcher />

              <button
                type="button"
                onClick={handleLogout}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
                title={t("Logout") || "Logout"}
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-800">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-400">Admin</p>
                </div>

                <div className="relative shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="h-10 w-10 rounded-xl border border-white object-cover shadow-sm ring-1 ring-slate-100"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm">
                      {initials || "AD"}
                    </div>
                  )}

                  <div className="absolute -bottom-1 -right-1 rounded-full border border-white bg-white p-1 shadow-sm opacity-0 transition group-hover:opacity-100">
                    <LogOut size={10} className="text-rose-500" />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-amber-300 hover:text-amber-700 lg:hidden"
              >
                <Menu size={18} strokeWidth={2.3} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 xl:px-8">
          <div className="mx-auto max-w-[1500px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;