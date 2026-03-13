import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { ROUTES, getDefaultRouteByRole } from "@/shared/constants/routes";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/storage";

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isLoading = useAuthStore(authSelectors.isLoading);
  const userRole = useAuthStore(authSelectors.userRole);
  const userStatus = useAuthStore((state) => state.user?.status); 
  
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.INTENDED_PATH,
        location.pathname + location.search
      );
    } catch (e) {
      console.error("[Storage Error] Failed to save intended path", e);
    }
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (userStatus === 'banned' || userStatus === 'suspended') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🚫</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Truy cập bị từ chối</h1>
          <p className="text-slate-500 mb-6">Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động do vi phạm chính sách.</p>
          <button 
            onClick={() => window.location.replace(ROUTES.HOME)}
            className="w-full py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.warn(`[Security] Unauthorized access attempt by ${userRole} to ${location.pathname}`);
    return <Navigate to={getDefaultRouteByRole(userRole)} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};