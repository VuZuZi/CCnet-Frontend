import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';
import { devConfig } from '@/config/app.config';

export function useUserProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const toast = useToast();

  const query = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: userAPI.getProfile,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      setUser(data);
      devConfig.log('User profile loaded:', data.email);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      devConfig.error('❌ Get user profile failed:', message);
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}

export default useUserProfile;
