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
      toast.success('Help request created successfully!');
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
      toast.success('Help request updated successfully!');
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
      toast.success('Help request deleted successfully!');
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
      toast.success('Help request cancelled successfully!');
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
      toast.success('Help request marked as completed!');
      invalidateAllHelpRequestQueries(queryClient);
      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useVerifyHelpRequest = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpRequestAPI.verify,
    onSuccess: (data, variables) => {
      toast.success(
        variables?.approved
          ? 'Help request verified successfully!'
          : 'Help request rejected successfully!'
      );

      invalidateAllHelpRequestQueries(queryClient);
      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);
      queryClient.invalidateQueries({
        queryKey: HELP_REQUEST_KEYS.asProject(data._id),
        exact: true,
      });
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
      toast.success('Organizer assigned. Notification sent with request link.');

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
      const verb = variables?.action === 'accept' ? 'accepted' : 'rejected';
      toast.success(`Assignment ${verb}. Notification sent with request link.`);

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