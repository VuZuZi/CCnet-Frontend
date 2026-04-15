import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Rocket,
  Flag,
  LogOut,
  ShieldCheck,
  HeartHandshake,
  Bell,
} from "lucide-react";

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

export function Sidebar({
  isOpen = true,
  onLogout,
  logoutLabel = "Logout",
}) {
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
                Control Center
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="h-3" />

      <nav className="flex-1 space-y-2 px-3 pb-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-amber-400 text-slate-900 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                } ${isOpen ? "justify-start" : "justify-center"}`
              }
              title={!isOpen ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {!isOpen && isActive ? (
                    <span className="absolute left-1 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-slate-900/80" />
                  ) : null}

                  <Icon
                    size={19}
                    strokeWidth={2.2}
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive ? "scale-105" : "group-hover:scale-105"
                    }`}
                  />

                  {isOpen ? (
                    <span className="truncate text-sm font-semibold">
                      {item.label}
                    </span>
                  ) : null}
                </>
              )}
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