import { useMutation } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';

export function useChangePassword() {
    const toast = useToast();
  return useMutation({
    mutationFn: userAPI.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
        const message = getErrorMessage(error);
        toast.error(message);
        console.error('❌ Change password failed:', message);
    }
  });
}

export default useChangePassword;
