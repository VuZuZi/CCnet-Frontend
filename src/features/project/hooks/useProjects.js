import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '../api/projectAPI';
import { queryKeys } from '@/shared/constants/queryKeys';

export function useProjects(params = {}) {
  const query = useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectAPI.getProjects(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    projects: query.data?.data?.projects || [],
    pagination: query.data?.data?.pagination || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMyProjects(params = {}) {
  const query = useQuery({
    queryKey: queryKeys.projects.myList(params),
    queryFn: () => projectAPI.getMyProjects(params),
    staleTime: 1000 * 60 * 5,
  });

  return {
    projects: query.data?.data?.projects || [],
    pagination: query.data?.data?.pagination || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
