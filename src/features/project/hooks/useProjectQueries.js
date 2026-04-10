import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { projectAPI } from '../api/projectAPI';

export const PROJECT_QUERY_KEYS = {
  all: ['projects'],
  explore: (filters) => [...PROJECT_QUERY_KEYS.all, 'explore', filters],
  workspace: (filters) => [...PROJECT_QUERY_KEYS.all, 'workspace', filters],
  detail: (id) => [...PROJECT_QUERY_KEYS.all, 'detail', id],
};

export const useExploreProjects = (filters) => {
  return useInfiniteQuery({
    queryKey: PROJECT_QUERY_KEYS.explore(filters),
    queryFn: ({ pageParam = 1 }) => {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters || {}).filter((entry) => {
          const [, value] = entry;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      return projectAPI.getExplore({
        ...cleanedFilters,
        page: pageParam,
        limit: 9,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
export const useProjectDetail = (id) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.detail(id),
    queryFn: () => projectAPI.getDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useWorkspaceProjects = (filters = {}) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.workspace(filters),
    queryFn: () => projectAPI.getWorkspaceProjects(filters),
    staleTime: 60 * 1000,
  });
};