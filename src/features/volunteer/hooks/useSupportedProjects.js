import { useQuery } from '@tanstack/react-query';
import { volunteerAPI } from '../api/volunteerAPI';

export function useSupportedProjects(params = {}, enabled = true) {
  return useQuery({
    queryKey: ['volunteer', 'supported-projects', params],
    queryFn: () => volunteerAPI.getMySupportedProjects(params),
    enabled: Boolean(enabled),
    staleTime: 60 * 1000,
  });
}

export default useSupportedProjects;