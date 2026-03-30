import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { getRedirectPath } from '@/shared/constants/routes';
import { SESSION_STORAGE_KEYS } from '@/shared/constants/storage';

export function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const userRole = useAuthStore((state) => state.user?.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    let intendedPath = null;
    try {
      intendedPath = sessionStorage.getItem(SESSION_STORAGE_KEYS.INTENDED_PATH);
      if (intendedPath) {
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.INTENDED_PATH);
      }
    } catch (error) {
      console.error('[PublicRoute] Lỗi đọc Session Storage:', error);
    }

    const redirectPath = getRedirectPath(intendedPath, userRole);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
