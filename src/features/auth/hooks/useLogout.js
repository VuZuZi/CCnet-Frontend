import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { authAPI } from '../api/authAPI';
import { ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/shared/contexts/ToastContext';

export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const toast = useToast();

  const executeLogout = () => {
    clearAuth();
    queryClient.clear(); 
    toast.info('Bạn đã đăng xuất');
    
    window.location.replace(ROUTES.HOME);
  };

  const mutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      executeLogout();
    },
    onError: (error) => {
      console.error('[Logout] API failed, forcing local logout:', error);
      executeLogout();
    },
  });

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
