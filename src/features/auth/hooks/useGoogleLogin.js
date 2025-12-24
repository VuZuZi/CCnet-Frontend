import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { authAPI } from '../api/authAPI';
import { ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

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
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
    onError: (error) => {
      const msg = getErrorMessage(error);
      toast.error(msg);
    }
  });

  return {
    loginWithGoogle: mutation.mutate, 
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error
  };
}