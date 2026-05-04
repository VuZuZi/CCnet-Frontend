import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { helpRequestAPI } from '../api/helpRequestAPI';
import { HELP_REQUEST_KEYS } from './useHelpRequestQueries';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

function invalidateAllHelpRequestQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });
  queryClient.invalidateQueries({
    queryKey: HELP_REQUEST_KEYS.details(),
    exact: false,
  });
  queryClient.invalidateQueries({
    queryKey: HELP_REQUEST_KEYS.organizerAssignedRoot(),
    exact: false,
  });
  queryClient.invalidateQueries({
    queryKey: HELP_REQUEST_KEYS.urgent(),
    exact: false,
  });
}

export const useCreateHelpRequest = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: helpRequestAPI.create,
    onSuccess: () => {
      toast.success('Tạo yêu cầu trợ giúp thành công!');
      invalidateAllHelpRequestQueries(queryClient);
      navigate('/need-help');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateHelpRequest = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpRequestAPI.update,
    onSuccess: (data) => {
      toast.success('Cập nhật yêu cầu trợ giúp thành công!');
      invalidateAllHelpRequestQueries(queryClient);
      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteHelpRequest = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: helpRequestAPI.delete,
    onSuccess: () => {
      toast.success('Xóa yêu cầu trợ giúp thành công!');
      invalidateAllHelpRequestQueries(queryClient);
      navigate('/need-help');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useCancelHelpRequest = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpRequestAPI.cancel,
    onSuccess: (data) => {
      toast.success('Đã hủy yêu cầu trợ giúp thành công!');
      invalidateAllHelpRequestQueries(queryClient);
      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useCompleteHelpRequest = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpRequestAPI.complete,
    onSuccess: (data) => {
      toast.success('Đã đánh dấu yêu cầu trợ giúp là hoàn thành!');
      invalidateAllHelpRequestQueries(queryClient);
      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useAssignOrganizer = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpRequestAPI.assignOrganizer,
    onSuccess: (data) => {
      toast.success('Đã gợi ý tổ chức. Đã gửi thông báo kèm liên kết yêu cầu.');

      invalidateAllHelpRequestQueries(queryClient);
      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);

      queryClient.refetchQueries({
        queryKey: HELP_REQUEST_KEYS.organizerAssignedRoot(),
        exact: false,
        type: 'active',
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useRespondHelpRequestAssignment = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpRequestAPI.respondAssignment,
    onSuccess: (data, variables) => {
      const verb = variables?.action === 'accept' ? 'chấp nhận' : 'từ chối';
      toast.success(`Đã ${verb} gợi ý. Đã gửi thông báo kèm liên kết yêu cầu.`);

      invalidateAllHelpRequestQueries(queryClient);
      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);

      queryClient.refetchQueries({
        queryKey: HELP_REQUEST_KEYS.organizerAssignedRoot(),
        exact: false,
        type: 'active',
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
