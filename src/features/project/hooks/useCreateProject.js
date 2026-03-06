import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../api/projectAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/shared/contexts/ToastContext';
import { queryKeys } from '@/shared/constants/queryKeys';

export function useCreateProject() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: projectAPI.createProject,

    onSuccess: (data) => {
      const project = data.data;
      
      toast.success('Campaign created successfully!');
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      
      // Navigate to project detail
      navigate(`${ROUTES.PROJECTS}/${project.projectId}`, { replace: true });
    },

    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });

  return {
    createProject: mutation.mutate,
    createProjectAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}
