import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { helpRequestAPI } from '../api/helpRequestAPI';
import { HELP_REQUEST_KEYS } from './useHelpRequestQueries';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/httpClient';

export const useCreateHelpRequest = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: helpRequestAPI.create,
    onSuccess: () => {
      toast.success('Help request created successfully!');
      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });
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
      toast.success('Help request updated successfully!');
      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });
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
      toast.success('Help request deleted successfully!');
      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });
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
      toast.success('Help request cancelled successfully!');
      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });
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
      toast.success('Help request marked as completed!');
      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });
      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
