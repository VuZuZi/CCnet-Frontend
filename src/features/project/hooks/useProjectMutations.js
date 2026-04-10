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
    mutationFn: (variables) => {
      const { silent, ...payload } = variables || {};
      void silent;
      return projectAPI.createDraft(payload);
    },
    onSuccess: (data, variables) => {
      setProjectId(data._id);
      if (!variables?.silent) {
        toast.success('Đã lưu bản nháp dự án (Bước 1)');
      }
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });
};

export const useUpdateDraftProject = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (variables) => {
      const { id, data, silent } = variables || {};
      void silent;
      return projectAPI.updateDraft({ id, data });
    },
    onSuccess: (_, variables) => {
      if (!variables?.silent) {
        toast.success('Đã cập nhật bản nháp thành công');
      }
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
      navigate('/projects');
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });
};

export const useReportProject = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }) => projectAPI.reportProject(projectId, payload),
    onSuccess: () => {
      toast.success('Báo cáo dự án đã được gửi. Cảm ơn bạn đã thông báo.');
      queryClient.invalidateQueries({ queryKey: ['project', 'detail'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || 'Báo cáo dự án thất bại');
      throw error;
    }
  });
};