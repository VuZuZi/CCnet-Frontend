import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';

export function useUserProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const toast = useToast();
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: userAPI.getProfile,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => setUser(data),
    onError: (error) => {
            const message = getErrorMessage(error);
            toast.error(message);
            console.error('❌ Get user profile failed:', message);
        }
  });
}

export default useUserProfile;
