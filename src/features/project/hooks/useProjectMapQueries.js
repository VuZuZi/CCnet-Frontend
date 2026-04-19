import { useQuery } from "@tanstack/react-query";
import { projectAPI } from "../api/projectAPI";

const PROJECT_MAP_BASE_KEY = ["projectMap"];

export const cleanProjectMapFilters = (filters = {}) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );

export const PROJECT_MAP_QUERY_KEYS = {
  all: PROJECT_MAP_BASE_KEY,
  map: (filters = {}) => [
    ...PROJECT_MAP_BASE_KEY,
    "viewport",
    cleanProjectMapFilters(filters),
  ],
};

export const useProjectMapQuery = (filters = {}, options = {}) => {
  const cleanedFilters = cleanProjectMapFilters(filters);

  return useQuery({
    queryKey: PROJECT_MAP_QUERY_KEYS.map(cleanedFilters),
    queryFn: () => projectAPI.getMapProjects(cleanedFilters),
    enabled:
      options.enabled ??
      Boolean(
        cleanedFilters.north !== undefined &&
          cleanedFilters.south !== undefined &&
          cleanedFilters.east !== undefined &&
          cleanedFilters.west !== undefined
      ),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
  });
};