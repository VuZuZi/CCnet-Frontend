import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { ROUTES, getDefaultRouteByRole } from "@/shared/constants/routes";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/storage";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isLoading = useAuthStore(authSelectors.isLoading);
  const userRole = useAuthStore(authSelectors.userRole);
  const userStatus = useAuthStore((state) => state.user?.status);

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.INTENDED_PATH,
        location.pathname + location.search,
      );
    } catch (error) {
      console.error("[Storage Error] Failed to save intended path", error);
    }

    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (userStatus === "banned" || userStatus === "suspended") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl text-red-500">
            🚫
          </div>

          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            Truy cập bị từ chối
          </h1>

          <p className="mb-6 text-slate-500">
            Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động do vi phạm chính sách.
          </p>

          <button
            type="button"
            onClick={() => window.location.replace(ROUTES.HOME)}
            className="w-full rounded-xl bg-slate-100 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const normalizedUserRole = normalizeRole(userRole);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole).filter(Boolean);

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(normalizedUserRole)
  ) {
    console.warn(
      `[Security] Unauthorized access attempt by ${userRole} to ${location.pathname}`,
    );

    return <Navigate to={getDefaultRouteByRole(userRole)} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};