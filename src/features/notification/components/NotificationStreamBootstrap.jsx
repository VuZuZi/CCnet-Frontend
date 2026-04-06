import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useNotificationStream } from '../hooks/useNotificationStream';

export default function NotificationStreamBootstrap() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isLoading = useAuthStore(authSelectors.isLoading);
  const user = useAuthStore(authSelectors.user);

  const currentUserId = user?.id || user?.userId || null;
  const enabled = !isLoading && isAuthenticated && Boolean(currentUserId);

  useNotificationStream({
    enabled,
    userId: enabled ? currentUserId : null,
  });

  return null;
}