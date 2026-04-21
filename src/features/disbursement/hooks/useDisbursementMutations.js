import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disbursementAPI } from '../api/disbursement.api';
import { DISBURSEMENT_QUERY_KEYS } from '../constants/disbursement.queryKeys';
import { GLOBAL_QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

export const useCreateDisbursementMutation = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: disbursementAPI.createRequest,
        retry: false,
        onSuccess: (data, variables) => {
            toast.success('Đã gửi yêu cầu giải ngân thành công!');
            queryClient.invalidateQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.lists() });
            
            const projectId = data?.projectId?._id || data?.projectId || variables.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Gửi yêu cầu giải ngân thất bại.');
        }
    });
};

export const useApproveDisbursementMutation = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, payload }) => disbursementAPI.approveRequest(id, payload),
        retry: false,
        onMutate: async ({ id, payload }) => {
            await queryClient.cancelQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.detail(id) });
            const previousDetail = queryClient.getQueryData(DISBURSEMENT_QUERY_KEYS.detail(id));

            if (previousDetail) {
                queryClient.setQueryData(DISBURSEMENT_QUERY_KEYS.detail(id), {
                    ...previousDetail,
                    status: payload.decision,
                });
            }
            return { previousDetail };
        },
        onError: (error, variables, context) => {
            if (context?.previousDetail) {
                queryClient.setQueryData(DISBURSEMENT_QUERY_KEYS.detail(variables.id), context.previousDetail);
            }
            toast.error(getErrorMessage(error) || 'Xử lý yêu cầu giải ngân thất bại.');
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.lists() });
            
            if (data && !error) {
                const projectId = data?.projectId?._id || data?.projectId;
                if (projectId) {
                    queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
                }
            }
        }
    });
};

export const useTransferActionMutation = (actionType = 'confirm') => {
    const queryClient = useQueryClient();
    const toast = useToast();

    const mutationFn = actionType === 'confirm' 
        ? ({ id, payload }) => disbursementAPI.confirmTransfer(id, payload)
        : ({ id, payload }) => disbursementAPI.failTransfer(id, payload);

    return useMutation({
        mutationFn,
        retry: false,
        onSuccess: (data, variables) => {
            toast.success(actionType === 'confirm' ? 'Xác nhận chuyển khoản thành công!' : 'Đã báo lỗi chuyển khoản cho Organizer!');
            queryClient.invalidateQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.detail(variables.id) });
            
            const projectId = data?.projectId?._id || data?.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Thao tác chuyển khoản thất bại.');
        }
    });
};

export const useUpdateDisbursementBankMutation = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, bankAccountId }) => disbursementAPI.updateBankAccount(id, bankAccountId),
        retry: false,
        onSuccess: (data, variables) => {
            toast.success('Đã cập nhật tài khoản nhận tiền mới!');
            queryClient.invalidateQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.detail(variables.id) });
            
            const projectId = data?.projectId?._id || data?.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Cập nhật tài khoản thất bại.');
        }
    });
};