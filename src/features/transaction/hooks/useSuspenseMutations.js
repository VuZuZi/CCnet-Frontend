import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suspenseAPI } from '../api/suspense.api';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { SUSPENSE_QUERY_KEYS } from '../constants/suspense.queryKeys';

export const useSubmitClaimMutation = () => {
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: suspenseAPI.submitClaim,
        retry: false,
        onSuccess: (res) => {
            toast.success(res.message || 'Đã nộp biên lai tra soát thành công.');
            queryClient.invalidateQueries({ queryKey: SUSPENSE_QUERY_KEYS.list() });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Nộp yêu cầu tra soát thất bại.');
        }
    });
};