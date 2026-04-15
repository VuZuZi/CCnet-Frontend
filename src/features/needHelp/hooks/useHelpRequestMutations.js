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

      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.urgent() });
      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.details() });
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
      toast.success('Organizer assigned. Notification sent with request link.');

      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });

      queryClient.removeQueries({
        queryKey: HELP_REQUEST_KEYS.organizerAssigned({}),
        exact: false,
      });

      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);

      queryClient.refetchQueries({
        queryKey: HELP_REQUEST_KEYS.organizerAssigned({}),
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

      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });

      queryClient.removeQueries({
        queryKey: HELP_REQUEST_KEYS.organizerAssigned({}),
        exact: false,
      });

      queryClient.refetchQueries({
        queryKey: HELP_REQUEST_KEYS.organizerAssigned({}),
        exact: false,
        type: 'active',
      });

      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};