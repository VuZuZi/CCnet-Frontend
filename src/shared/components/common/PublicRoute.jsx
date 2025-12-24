import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { ROUTES } from '@/shared/constants/routes';
import { SESSION_STORAGE_KEYS } from '@/shared/constants/storage';

export function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    try {
      const intendedPath = sessionStorage.getItem(SESSION_STORAGE_KEYS.INTENDED_PATH);
      if (intendedPath) {
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.INTENDED_PATH);
        return <Navigate to={intendedPath} replace />;
      }
    } catch (error) {
      console.error('Failed to retrieve intended path:', error);
    }

    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};