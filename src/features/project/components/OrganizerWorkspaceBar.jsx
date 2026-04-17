import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowRight,
  PlusCircle,
  HeartHandshake,
  FolderHeart,
} from "lucide-react";

import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { ROLES } from "@/shared/constants/roles";

const isOrganizerRole = (userRole) => {
  const normalizedRole = String(userRole || "").toLowerCase();
  return userRole === ROLES.ORGANIZER || normalizedRole === "organizer";
};

const isSignedInUser = (userRole) => {
  const normalizedRole = String(userRole || "").toLowerCase();
  return Boolean(
    normalizedRole === "user" ||
      normalizedRole === "volunteer" ||
      normalizedRole === "organizer" ||
      userRole === ROLES.USER ||
      userRole === ROLES.ORGANIZER
  );
};

export function OrganizerWorkspaceBar() {
  const userRole = useAuthStore(authSelectors.userRole);

  if (!isSignedInUser(userRole)) {
    return null;
  }

  if (isOrganizerRole(userRole)) {
    return (
      <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 p-4 px-6 text-white shadow-sm sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-2">
            <LayoutDashboard size={20} className="text-amber-400" />
          </div>

          <div>
            <h3 className="text-sm font-bold">Không gian làm việc của bạn</h3>
            <p className="text-xs text-slate-400">
              Quản lý và theo dõi các dự án gây quỹ đang hoạt động.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link
            to="/projects/create"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 sm:flex-none"
          >
            <PlusCircle size={16} />
            Tạo dự án
          </Link>

          <Link
            to="/workspace"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm shadow-amber-500/20 transition-colors hover:bg-amber-600 sm:flex-none"
          >
            Vào Workspace
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-4 px-6 text-slate-900 shadow-sm sm:flex-row">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-100 p-2">
          <HeartHandshake size={20} className="text-amber-700" />
        </div>

        <div>
          <h3 className="text-sm font-bold">Những dự án bạn đang tham gia</h3>
        </div>
      </div>

      <div className="flex w-full items-center gap-3 sm:w-auto">
        <Link
          to="/profile/supported-projects"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm shadow-amber-500/20 transition-colors hover:bg-amber-600 sm:w-auto"
        >
          <FolderHeart size={16} />
          Xem dự án đã tham gia
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default OrganizerWorkspaceBar;