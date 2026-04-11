import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionAPI } from '../api/transaction.api';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { WALLET_QUERY_KEYS } from '@/features/wallet/constants/wallet.queryKeys';
import { TRANSACTION_QUERY_KEYS } from '../constants/transaction.queryKeys';
import { useTransactionLockStore } from '@/shared/stores/useTransactionLockStore';

export const useDonateMutation = () => {
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: transactionAPI.donate,
        retry: false,
        onMutate: () => {
            useTransactionLockStore.getState().lock('Đang khởi tạo giao dịch an toàn...');
        },
        onSuccess: (res, variables) => {
            if (variables.paymentMethod === 'WALLET') {
                toast.success('Ủng hộ qua ví nội bộ thành công!');

                queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.me() });
                queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.history({ limit: 10 }) });

                queryClient.invalidateQueries({ queryKey: ['projects', 'detail', variables.projectId] });

                queryClient.invalidateQueries({
                    queryKey: TRANSACTION_QUERY_KEYS.projectDonors(variables.projectId)
                });
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Giao dịch thất bại.');
        },
        onSettled: () => {
            useTransactionLockStore.getState().unlock();
        }
    });
};

export const useWithdrawMutation = () => {
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: transactionAPI.withdraw,
        retry: false,
        onMutate: () => {
            useTransactionLockStore.getState().lock('Đang tạo lệnh rút tiền, vui lòng không đóng trình duyệt...');
        },
        onSuccess: () => {
            toast.success('Tạo lệnh rút tiền thành công. Vui lòng chờ Kế toán duyệt.');
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.me() });
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.history({ limit: 10 }) });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Lỗi khi tạo lệnh rút tiền.');
        },
        onSettled: () => {
            useTransactionLockStore.getState().unlock();
        }
    });
};

export const useRefundMutation = () => {
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: transactionAPI.refund,
        retry: false,
        onMutate: () => {
            useTransactionLockStore.getState().lock('Đang xử lý hoàn tiền vào Ví...');
        },
        onSuccess: (res, variables) => {
            toast.success('Xin hoàn tiền thành công! Số dư đã được cộng vào Ví của bạn.');

            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.me() });
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.history({ limit: 10 }) });

            queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEYS.myDonations() });

            if (variables.projectId) {
                queryClient.invalidateQueries({
                    queryKey: TRANSACTION_QUERY_KEYS.projectDonors(variables.projectId)
                });
                queryClient.invalidateQueries({ queryKey: ['projects', 'detail', variables.projectId] });
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Xin hoàn tiền thất bại.');
        },
        onSettled: () => {
            useTransactionLockStore.getState().unlock();
        }
    });
};