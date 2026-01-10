import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '../api/projectAPI';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';

export function useProjects(filters = {}) {
  const toast = useToast();

  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectAPI.getProjects(filters),
    staleTime: 2 * 60 * 1000,
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      console.error('Get projects failed:', message);
    }
  });
}

export default useProjects;
