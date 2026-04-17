import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { notificationApi } from '../api/notification.api';

function hasExplicitNavigationTarget(location) {
  const pathname = String(location?.pathname || '');
  const search = String(location?.search || '');

  if (pathname.startsWith('/projects/')) return true;
  if (pathname.startsWith('/messages/')) return true;
  if (pathname.startsWith('/admin/notifications')) return true;

  const params = new URLSearchParams(search);
  return (
    params.has('tab') ||
    params.has('subTab') ||
    params.has('applicationId') ||
    params.has('notificationId')
  );
}

export default function AdminNotificationRedirectGate() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isLoading = useAuthStore(authSelectors.isLoading);
  const user = useAuthStore(authSelectors.user);

  const hasHandledRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (isLoading) return;
      if (!isAuthenticated) return;
      if (hasHandledRef.current) return;

      const role = String(user?.role || '').toLowerCase();

      if (role !== 'admin') {
        hasHandledRef.current = true;
        return;
      }

      if (hasExplicitNavigationTarget(location)) {
        hasHandledRef.current = true;
        return;
      }

      try {
        const result = await notificationApi.getUnreadCount();
        const unreadCount = Number(result?.unreadCount || 0);

        hasHandledRef.current = true;

        if (unreadCount > 0 && location.pathname !== '/admin/notifications') {
          navigate('/admin/notifications', { replace: true });
        }
      } catch {
        hasHandledRef.current = true;
      }
    };

    run();
  }, [isLoading, isAuthenticated, user, location, navigate]);

  return null;
}