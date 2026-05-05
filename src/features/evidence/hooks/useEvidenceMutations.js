import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evidenceAPI } from '../api/evidence.api';
import { EVIDENCE_QUERY_KEYS } from '../constants/evidence.queryKeys';
import { GLOBAL_QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

const unwrapEvidenceResult = (data) =>
    data?.evidence || data?.data?.evidence || data?.data || data || {};

const getSubmitSuccessMessage = (data) => {
    const result = unwrapEvidenceResult(data);

    if (result?.isAutoPass) {
        return 'Mốc đã được nghiệm thu tự động bằng ảnh và vị trí hiện trường.';
    }
    if (result?.gpsFailureReason === 'MISSING_LOCATION') {
        return 'Không lấy được vị trí hiện tại. Bạn vẫn có thể tải ảnh bằng chứng để admin duyệt thủ công.';
    }
    if (result?.gpsFailureReason === 'OUT_OF_RANGE') {
        return 'Vị trí chưa khớp với khu vực thực hiện mốc. Bằng chứng đã được gửi để admin duyệt thủ công.';
    }
    return 'Bằng chứng đã được gửi và đang chờ admin duyệt.';
};

export const useSubmitEvidenceMutation = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: evidenceAPI.submitEvidence,
        retry: false,
        onSuccess: (data, variables) => {
            toast.success(getSubmitSuccessMessage(data));
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
            toast.success(getSubmitSuccessMessage(data));
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
        onError: (error) => {
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
