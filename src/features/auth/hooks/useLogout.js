import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { authAPI } from '../api/authAPI';
import { ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/shared/contexts/ToastContext';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: authAPI.logout,
    
    onSuccess: () => {
      toast.info('You have been logged out');
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    },
    
    onError: (error) => {
      console.error('Logout API failed:', error);
      clearAuth();
      queryClient.clear();
      toast.info('You have been logged out');
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}