import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../api/authAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';

export function useResendOTP() {
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: authAPI.resendOTP,
    
    onSuccess: () => {
      toast.success('New OTP has been sent to your email');
    },
    
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      console.error('Resend OTP failed:', message);
    },
  });

  return {
    resendOTP: mutation.mutate,
    resendOTPAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}