import { useMutation } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';
import { devConfig } from '@/config/app.config';

export function useChangePassword() {
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: userAPI.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      devConfig.log('Password changed successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      devConfig.error('❌ Change password failed:', message);
    },
  });

  return {
    changePassword: mutation.mutate,
    changePasswordAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}

export default useChangePassword;
