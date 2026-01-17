import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '../api/projectAPI';
import { queryKeys } from '@/shared/constants/queryKeys';

export function useProjectDetail(projectId) {
  const query = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => projectAPI.getProjectById(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    project: query.data?.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
