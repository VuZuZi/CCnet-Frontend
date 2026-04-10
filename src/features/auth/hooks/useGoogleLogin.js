import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { authAPI } from '../api/authAPI';
import { getDefaultRouteByRole } from '@/shared/constants/routes';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { devConfig } from '@/config/app.config'; 

export function useGoogleLogin() {
  const navigate = useNavigate();
  const { setAuthSuccess } = useAuthStore();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: authAPI.loginWithGoogle,
    onSuccess: (data) => {
      const { user, tokens } = data.data;
      
      setAuthSuccess(user, tokens.accessToken);
      
      toast.success(`Welcome via Google, ${user.fullName}!`);
      devConfig.log('Google Login successful:', user.email); 
      
      navigate(getDefaultRouteByRole(user?.role), { replace: true });
    },
    onError: (error) => {
      const msg = getErrorMessage(error);
      toast.error(msg);
      devConfig.error('❌ Google Login failed:', msg);
    }
  });

  return {
    loginWithGoogle: mutation.mutate, 
    loginWithGoogleAsync: mutation.mutateAsync, 
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset 
  };
}