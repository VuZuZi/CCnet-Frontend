import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAPI } from '../api/bank.api';
import { BANK_QUERY_KEYS } from '../constants/bank.queryKeys';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

export const useAddBankAccount = () => {
    const toast = useToast();

    return useMutation({
        mutationFn: bankAPI.addAccount,
        retry: false,
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Thêm thẻ thất bại');
        },
    });
};

export const useVerifyBankAccount = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: bankAPI.verifyAccount,
        retry: false,
        onSuccess: () => {
            toast.success('Xác thực thẻ ngân hàng thành công!');
            queryClient.invalidateQueries({ queryKey: BANK_QUERY_KEYS.list() });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Xác thực thất bại');
        },
    });
};