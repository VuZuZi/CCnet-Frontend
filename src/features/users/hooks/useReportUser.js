import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

export function useReportUser() {
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, payload }) => userAPI.reportUser(userId, payload),
        onSuccess: () => {
            toast.success('Báo cáo người dùng đã được gửi thành công.');
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Báo cáo người dùng thất bại');
            throw error;
        },
    });
}
