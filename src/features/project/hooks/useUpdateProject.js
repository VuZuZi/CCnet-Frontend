import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI } from '../api/projectAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';
import { queryKeys } from '@/shared/constants/queryKeys';

export function useUpdateProject() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }) => projectAPI.updateProject(id, data),

    onSuccess: (data, variables) => {
      toast.success('Campaign updated successfully!');
      
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(variables.id) 
      });
    },

    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });

  return {
    updateProject: mutation.mutate,
    updateProjectAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}
