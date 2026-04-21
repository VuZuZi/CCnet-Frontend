import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evidenceAPI } from '../api/evidence.api';
import { EVIDENCE_QUERY_KEYS } from '../constants/evidence.queryKeys';
import { GLOBAL_QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

export const useSubmitEvidenceMutation = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: evidenceAPI.submitEvidence,
        retry: false,
        onSuccess: (data, variables) => {
            toast.success('Đã nộp báo cáo nghiệm thu thành công. Đang chờ phê duyệt!');
            queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEYS.lists() });
            
            // Đồng bộ trạng thái Project Detail (Sửa lỗi Tab không update)
            const projectId = data?.projectId?._id || data?.projectId || variables.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Nộp báo cáo thất bại.');
        }
    });
};

export const useUpdateEvidenceMutation = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, payload }) => evidenceAPI.updateEvidence(id, payload),
        retry: false,
        onSuccess: (data, variables) => {
            toast.success('Đã nộp lại báo cáo thành công!');
            queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEYS.lists() });
            
            const projectId = data?.projectId?._id || data?.projectId || variables.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error) || 'Cập nhật báo cáo thất bại.');
        }
    });
};

export const useReviewEvidenceMutation = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, payload }) => evidenceAPI.reviewEvidence(id, payload),
        retry: false,
        onMutate: async ({ id, payload }) => {
            await queryClient.cancelQueries({ queryKey: EVIDENCE_QUERY_KEYS.detail(id) });
            const previousEvidence = queryClient.getQueryData(EVIDENCE_QUERY_KEYS.detail(id));

            if (previousEvidence) {
                queryClient.setQueryData(EVIDENCE_QUERY_KEYS.detail(id), {
                    ...previousEvidence,
                    status: payload.status,
                    reviewNotes: payload.reviewNotes
                });
            }
            return { previousEvidence };
        },
        onError: (error, variables, context) => {
            if (context?.previousEvidence) {
                queryClient.setQueryData(EVIDENCE_QUERY_KEYS.detail(variables.id), context.previousEvidence);
            }
            toast.error(getErrorMessage(error) || 'Thao tác kiểm duyệt thất bại.');
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEYS.lists() });
            
            // Xử lý đồng bộ Project an toàn
            if (data && !error) {
                const projectId = data?.projectId?._id || data?.projectId;
                if (projectId) {
                    queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
                }
            }
        }
    });
};