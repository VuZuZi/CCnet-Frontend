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
        t("Bạn có chắc chắn muốn đăng xuất không?") ||
        "Bạn có chắc chắn muốn đăng xuất không?"
      )
    ) {
      logout();
    }
  };

  const displayName = user?.fullName || "Quản trị viên hệ thống";
  const initials = displayName
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="ccnet-admin-shell bg-slate-50 text-slate-900">
      <NotificationStreamBootstrap />

      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          aria-label="Đóng thanh quản trị"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <Sidebar
        isOpen={isSidebarOpen}
        onLogout={handleLogout}
        logoutLabel={t("Đăng xuất") || "Đăng xuất"}
      />

      <div className="grid min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 min-w-0 flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-6 xl:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-amber-300 hover:text-amber-700"
                aria-label={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose size={18} strokeWidth={2.3} />
                ) : (
                  <PanelLeftOpen size={18} strokeWidth={2.3} />
                )}
              </button>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
              <div className="relative hidden xl:block">
                <Search
                  size={18}
                  strokeWidth={2.2}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <NavbarNotificationAction />
              <LanguageSwitcher />

              <button
                type="button"
                onClick={handleLogout}
                className="group flex max-w-[min(240px,42vw)] min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 sm:gap-3 sm:px-3"
                title={t("Đăng xuất") || "Đăng xuất"}
              >
                <div className="hidden min-w-0 text-right sm:block">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-400">Quản trị viên</p>
                </div>

                <div className="relative shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Ảnh đại diện"
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

        <main className="min-w-0 overflow-y-auto px-3 py-4 sm:px-4 md:px-6 md:py-5 xl:px-8">
          <div className="mx-auto w-full max-w-[1500px] min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
