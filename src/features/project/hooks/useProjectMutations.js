import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI } from '../api/projectAPI';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useNavigate } from 'react-router-dom';

export const useCreateDraftProject = () => {
  const toast = useToast();
  const setProjectId = useProjectDraftStore(state => state.setProjectId);

  return useMutation({
    mutationFn: projectAPI.createDraft,
    onSuccess: (data) => {
      setProjectId(data._id);
      toast.success('Đã lưu bản nháp dự án (Bước 1)');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });
};

export const useUpdateDraftProject = () => {
  const toast = useToast();
  
  return useMutation({
    mutationFn: projectAPI.updateDraft,
    onSuccess: () => {
      toast.success('Đã cập nhật bản nháp thành công');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });
};

export const useSubmitProject = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const resetDraft = useProjectDraftStore(state => state.resetDraft);

  return useMutation({
    mutationFn: projectAPI.submitForApproval,
    onSuccess: () => {
      toast.success('Đã gửi dự án để chờ duyệt thành công!');
      queryClient.invalidateQueries({ queryKey: ['projects', 'workspace'] });
      resetDraft();
      navigate('/dashboard');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });
};