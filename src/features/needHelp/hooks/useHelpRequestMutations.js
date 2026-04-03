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

export const useAssignOrganizer = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpRequestAPI.assignOrganizer,
    onSuccess: (data, variables) => {
      toast.success('Organizer assigned. Notification sent with request link.');
      
      // Clear all related caches
      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });
      
      // Specifically invalidate all organizer assigned queries regardless of filters
      // This ensures organizer sees the new assignment immediately
      queryClient.removeQueries({ 
        queryKey: HELP_REQUEST_KEYS.organizerAssigned({}),
        exact: false, // Match organizer-assigned queries with any filter combination
      });
      
      // Set the updated help request in cache
      queryClient.setQueryData(HELP_REQUEST_KEYS.detail(data._id), data);
      
      // Refetch all active organizer assigned queries to ensure fresh data
      queryClient.refetchQueries({
        queryKey: HELP_REQUEST_KEYS.organizerAssigned({}),
        exact: false,
        type: 'active', // Only refetch queries that are currently in use
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
      
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });
      
      // Clear and refetch organizer assigned queries
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
