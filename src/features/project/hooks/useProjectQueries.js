import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { projectAPI } from '../api/projectAPI';

export const useFeaturedProjects = () => {
  return useQuery({
    queryKey: ['projects', 'featured'],
    queryFn: projectAPI.getFeatured,
    staleTime: 10 * 60 * 1000,
  });
};

export const useExploreProjects = (filters) => {
  return useInfiniteQuery({
    queryKey: ['projects', 'explore', filters],
    queryFn: ({ pageParam = 1 }) => projectAPI.getExplore({ pageParam, ...filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectDetail = (id) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectAPI.getDetail(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useWorkspaceProjects = (params = {}) => {
  return useQuery({
    queryKey: ['projects', 'workspace', params],
    queryFn: () => projectAPI.getWorkspaceProjects(params),
    staleTime: 60 * 1000,
  });
};