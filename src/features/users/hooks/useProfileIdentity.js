import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

export function useProfileIdentity(urlId) {
  const currentUser = useAuthStore(authSelectors.user);
  const currentUserId = currentUser?.id || currentUser?.userId;

  const isOwnProfile = !urlId || String(urlId) === String(currentUserId);
  
  const targetUserId = isOwnProfile ? currentUserId : urlId;

  return {
    isOwnProfile,
    targetUserId,
    currentUserId,
    isAuthReady: !!currentUserId 
  };
}