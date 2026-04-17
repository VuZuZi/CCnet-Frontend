import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { useNotificationStream } from "../hooks/useNotificationStream";

export default function NotificationStreamBootstrap() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isLoading = useAuthStore(authSelectors.isLoading);
  const user = useAuthStore(authSelectors.user);
  const currentUserId = useAuthStore(authSelectors.userId);

  const fallbackUserId = user?._id || user?.id || user?.userId || null;
  const resolvedUserId = currentUserId || fallbackUserId;

  const enabled = !isLoading && isAuthenticated && Boolean(resolvedUserId);

  useNotificationStream({
    enabled,
    userId: enabled ? resolvedUserId : null,
  });

  return null;
}