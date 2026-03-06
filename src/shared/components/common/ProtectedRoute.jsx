import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { ROUTES } from "@/shared/constants/routes";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/storage";

export function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const userRole = useAuthStore((state) => state.user?.role);

  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!isAuthenticated) {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.INTENDED_PATH,
        location.pathname,
      );
    } catch (e) {
      console.error(e);
    }

    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};
