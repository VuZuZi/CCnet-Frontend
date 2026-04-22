import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disbursementAPI } from '../api/disbursement.api';
import { DISBURSEMENT_QUERY_KEYS } from '../constants/disbursement.queryKeys';
import { GLOBAL_QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

export const useCreateDisbursementMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: disbursementAPI.createRequest,
        retry: false,
        ...options,
        onSuccess: (data, variables, context) => {
            toast.success('Đã gửi yêu cầu giải ngân thành công!');
            
            queryClient.invalidateQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.lists() });
            
            const projectId = data?.projectId?._id || data?.projectId || variables.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
            }

            if (options.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            toast.error(getErrorMessage(error) || 'Gửi yêu cầu giải ngân thất bại.');
            if (options.onError) {
                options.onError(error, variables, context);
            }
        }
    });
};

export const useApproveDisbursementMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, payload }) => disbursementAPI.approveRequest(id, payload),
        retry: false,
        ...options,
        onSuccess: (data, variables, context) => {
            toast.success('Phê duyệt yêu cầu giải ngân thành công!');
            queryClient.invalidateQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.detail(variables.id) });
            
            const projectId = data?.projectId?._id || data?.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
            }

            if (options.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            toast.error(getErrorMessage(error) || 'Phê duyệt thất bại.');
            if (options.onError) {
                options.onError(error, variables, context);
            }
        }
    });
};

export const useTransferActionMutation = (actionType, options = {}) => {
    const queryClient = useQueryClient();
    const toast = useToast();

    const actionFn = actionType === 'confirm' 
        ? ({ id, payload }) => disbursementAPI.confirmTransfer(id, payload)
        : ({ id, payload }) => disbursementAPI.failTransfer(id, payload);

    return useMutation({
        mutationFn: actionFn,
        retry: false,
        ...options,
        onSuccess: (data, variables, context) => {
            toast.success(actionType === 'confirm' ? 'Xác nhận chuyển khoản thành công!' : 'Đã báo lỗi chuyển khoản cho Organizer!');
            queryClient.invalidateQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.detail(variables.id) });
            
            const projectId = data?.projectId?._id || data?.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
            }

            if (options.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            toast.error(getErrorMessage(error) || 'Thao tác chuyển khoản thất bại.');
            if (options.onError) {
                options.onError(error, variables, context);
            }
        }
    });
};

export const useUpdateDisbursementBankMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, bankAccountId }) => disbursementAPI.updateBankAccount(id, bankAccountId),
        retry: false,
        ...options,
        onSuccess: (data, variables, context) => {
            toast.success('Đã cập nhật tài khoản nhận tiền mới!');
            queryClient.invalidateQueries({ queryKey: DISBURSEMENT_QUERY_KEYS.detail(variables.id) });
            
            const projectId = data?.projectId?._id || data?.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
            }

            if (options.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            toast.error(getErrorMessage(error) || 'Cập nhật tài khoản thất bại.');
            if (options.onError) {
                options.onError(error, variables, context);
            }
        }
    });
};