import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/authAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/shared/contexts/ToastContext';

export function useVerifyOTP() {
  const navigate = useNavigate();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: authAPI.verifyOTP,
    
    onSuccess: () => {
      toast.success('Xác thực email thành công! Vui lòng đăng nhập.');
      
      navigate(ROUTES.LOGIN, { 
        state: { verified: true },
        replace: true 
      });
    },
    
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      console.error('OTP verification failed:', message);
    },
  });

  return {
    verifyOTP: mutation.mutate,
    verifyOTPAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}
