import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

export function useChangeAvatar() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser); 

  const mutation = useMutation({
    mutationFn: userAPI.changeAvatar,
    onSuccess: (data) => {
      setUser(data);
      
      queryClient.setQueryData(['user', 'profile'], data);
      
      toast.success('Avatar updated successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });

  return {
    changeAvatar: mutation.mutate,
    isPending: mutation.isPending,
  };
}