import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionAPI } from '../api/transaction.api';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { WALLET_QUERY_KEYS } from '@/features/wallet/constants/wallet.queryKeys';

export const useDonateMutation = () => {
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: transactionAPI.donate,
        retry: false,
        onSuccess: (res, variables) => {
            if (variables.paymentMethod === 'WALLET') {
                toast.success('Ủng hộ qua ví nội bộ thành công!');
                queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.me() });
                queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.history({ limit: 10 }) });
                queryClient.invalidateQueries({ queryKey: ['projects', 'detail', variables.projectId] });
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Giao dịch thất bại.');
        },
    });
};

export const useWithdrawMutation = () => {
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: transactionAPI.withdraw,
        retry: false,
        onSuccess: () => {
            toast.success('Tạo lệnh rút tiền thành công. Vui lòng chờ Kế toán duyệt.');
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.me() });
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.history({ limit: 10 }) });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Lỗi khi tạo lệnh rút tiền.');
        },
    });
};