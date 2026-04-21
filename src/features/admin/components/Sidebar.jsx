import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Rocket,
  Flag,
  LogOut,
  ShieldCheck,
  HeartHandshake,
  Bell,
  Landmark
} from "lucide-react";

const MENU_ITEMS = [
  {
    path: "/admin",
    label: "Bảng điều khiển",
    icon: LayoutDashboard,
    end: true,
    matchPaths: ["/admin"],
  },
  {
    path: "/admin/notifications",
    label: "Thông báo",
    icon: Bell,
    end: false,
    matchPaths: ["/admin/notifications", "/admin/notifications/history"],
  },
  {
    path: "/admin/users",
    label: "Quản lý người dùng",
    icon: Users,
    end: false,
    matchPaths: ["/admin/users", "/admin/user-action-logs"],
  },
  {
    path: "/admin/organizers",
    label: "Yêu cầu ban tổ chức",
    icon: ShieldCheck,
    end: false,
    matchPaths: ["/admin/organizers", "/admin/organizer-action-logs"],
  },
  {
    path: "/admin/need-help",
    label: "Yêu cầu hỗ trợ",
    icon: HeartHandshake,
    end: false,
    matchPaths: ["/admin/need-help", "/admin/need-help-action-logs"],
  },
  {
    path: "/admin/projects",
    label: "Dự án",
    icon: Rocket,
    end: false,
    matchPaths: ["/admin/projects"],
  },
  {
    path: "/admin/reports",
    label: "Báo cáo & Nhật ký",
    icon: Flag,
    end: false,
    matchPaths: ["/admin/reports"],
  },
{
    path: "/admin/finance",
    label: "Sổ cái & Nghiệm thu",
    icon: Landmark,
    end: false,
    matchPaths: ["/admin/finance"],
  },
];

export function Sidebar({
  isOpen = true,
  onLogout,
  logoutLabel = "Đăng xuất",
}) {
  const location = useLocation();

  const isItemActive = (item) => {
    return item.matchPaths.some((prefix) => {
      if (prefix === "/admin") {
        return location.pathname === "/admin";
      }
      return location.pathname.startsWith(prefix);
    });
  };

  return (
    <aside
      className={`z-30 flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ${
        isOpen ? "w-[260px]" : "w-[88px]"
      }`}
    >
      <div className="flex h-20 items-center border-b border-slate-200 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow-sm">
            <Rocket size={20} strokeWidth={2.4} />
          </div>

          {isOpen ? (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-slate-900">
                CCNet Admin
              </h1>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Trung tâm điều khiển
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="h-3" />

      <nav className="flex-1 space-y-2 px-3 pb-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                active
                  ? "bg-amber-400 text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              } ${isOpen ? "justify-start" : "justify-center"}`}
              title={!isOpen ? item.label : undefined}
            >
              {!isOpen && active ? (
                <span className="absolute left-1 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-slate-900/80" />
              ) : null}

              <Icon
                size={19}
                strokeWidth={2.2}
                className={`shrink-0 transition-transform duration-200 ${
                  active ? "scale-105" : "group-hover:scale-105"
                }`}
              />

              {isOpen ? (
                <span className="truncate text-sm font-semibold">
                  {item.label}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={onLogout}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-50 ${
            isOpen ? "justify-start" : "justify-center"
          }`}
          title={!isOpen ? logoutLabel : undefined}
        >
          <LogOut
            size={18}
            strokeWidth={2.2}
            className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          {isOpen ? <span>{logoutLabel}</span> : null}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;