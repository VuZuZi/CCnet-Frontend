import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../api/projectAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';
import { queryKeys } from '@/shared/constants/queryKeys';
import { ROUTES } from '@/shared/constants/routes';

export function useDeleteProject() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (id) => projectAPI.deleteProject(id),

    onSuccess: () => {
      toast.success('Campaign deleted successfully!');
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      
      // Navigate back to projects list
      navigate(ROUTES.PROJECTS, { replace: true });
    },

    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });

  return {
    deleteProject: mutation.mutate,
    deleteProjectAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}
