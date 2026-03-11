import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { authAPI } from '../api/authAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { ROUTES } from '@/shared/constants/routes';
import { devConfig } from '@/config/app.config';
import { useToast } from '@/shared/contexts/ToastContext';

export function useLogin() {
  const navigate = useNavigate();
  const { setAuthSuccess } = useAuthStore();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: authAPI.login,
    
    onSuccess: (data) => {
      const { user, tokens } = data.data;
      
      setAuthSuccess(user, tokens.accessToken);
      
      toast.success(`Welcome back, ${user.fullName}!`);
      devConfig.log('Login successful:', user.email);
      
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
    
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      devConfig.error('❌ Login failed:', message);
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}