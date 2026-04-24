import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/authAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/shared/contexts/ToastContext';

export function useRegister() {
  const navigate = useNavigate();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: authAPI.register,
    
    onSuccess: (data) => {
      const { userId, email } = data.data;
      
    toast.success(`Đã gửi mã xác thực đến ${email}`);
      
      navigate(ROUTES.VERIFY_OTP, { 
        state: { userId, email },
        replace: true 
      });
    },
    
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      console.error('Registration failed:', message);
    },
  });

  return {
    register: mutation.mutate,
    registerAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}
