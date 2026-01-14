import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { devConfig } from '@/config/app.config';

export function useUpdateUserProfile() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const updateProfileState = useAuthStore((state) => state.updateProfile);

  const mutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (data) => {
      updateProfileState(data);
      queryClient.setQueryData(['user', 'profile'], data);
      toast.success('Profile updated successfully');
      devConfig.log('Profile updated:', data.email);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      devConfig.error('❌ Update profile failed:', message);
    },
  });

  return {
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}

export default useUpdateUserProfile;
