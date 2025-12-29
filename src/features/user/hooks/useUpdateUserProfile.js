import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';


export function useUpdateUserProfile() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const updateProfileState = useAuthStore((state) => state.updateProfile);

  return useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (data) => {
      updateProfileState(data);
      queryClient.setQueryData(['user', 'profile'], data);
      toast.success('User profile updated successfully');
    },
    onError: (error) => {
        const message = getErrorMessage(error);
        toast.error(message);
        console.error('❌ Update user profile failed:', message);
    }
  });
}

export default useUpdateUserProfile;
