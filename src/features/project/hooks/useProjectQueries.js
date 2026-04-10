import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";
import { projectAPI } from "../api/projectAPI";

const PROJECT_BASE_KEY = ["projects"];
const CATEGORY_VALUES = ["Y_TE", "GIAO_DUC", "MOI_TRUONG", "THIEN_TAI", "XAY_DUNG"];

export const PROJECT_QUERY_KEYS = {
  all: PROJECT_BASE_KEY,
  explore: (filters) => [...PROJECT_BASE_KEY, "explore", filters],
  detail: (id) => [...PROJECT_BASE_KEY, "detail", id],
  featured: [...PROJECT_BASE_KEY, "featured"],
  volunteerNeeded: [...PROJECT_BASE_KEY, "volunteer-needed"],
  categoryCount: (filters, category) => [
    ...PROJECT_BASE_KEY,
    "category-count",
    filters,
    category,
  ],
};

function cleanFilters(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );
}

export const useExploreProjects = (filters) => {
  const cleanedFilters = cleanFilters(filters);

  return useInfiniteQuery({
    queryKey: PROJECT_QUERY_KEYS.explore(cleanedFilters),
    queryFn: ({ pageParam = 1 }) =>
      projectAPI.getExplore({
        ...cleanedFilters,
        page: pageParam,
        limit: 9,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
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

export const useFeaturedProject = () => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.featured,
    queryFn: async () => {
      const result = await projectAPI.getFeatured();

      if (Array.isArray(result)) return result[0] || null;
      if (result?.project) return result.project;
      return result || null;
    },
    staleTime: 3 * 60 * 1000,
  });
};

export const useVolunteerNeededProjects = () => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.volunteerNeeded,
    queryFn: () => projectAPI.getVolunteerNeeded(),
    staleTime: 3 * 60 * 1000,
  });
};

export const useProjectCategoryCounts = (filters = {}) => {
  const sanitizedBaseFilters = Object.fromEntries(
    Object.entries(filters || {}).filter(
      ([key, value]) =>
        key !== "category" &&
        value !== "" &&
        value !== null &&
        value !== undefined
    )
  );

  const queries = useQueries({
    queries: CATEGORY_VALUES.map((category) => ({
      queryKey: PROJECT_QUERY_KEYS.categoryCount(sanitizedBaseFilters, category),
      queryFn: async () => {
        const result = await projectAPI.getExplore({
          ...sanitizedBaseFilters,
          category,
          page: 1,
          limit: 1,
        });

        return {
          category,
          totalItems: Number(result?.pagination?.totalItems || 0),
        };
      },
      staleTime: 3 * 60 * 1000,
      placeholderData: (previousData) => previousData,
    })),
  });

  const countsByCategory = CATEGORY_VALUES.reduce((acc, category, index) => {
    acc[category] = Number(queries[index]?.data?.totalItems || 0);
    return acc;
  }, {});

  return {
    countsByCategory,
    isLoading: queries.some((query) => query.isLoading && !query.data),
    isFetching: queries.some((query) => query.isFetching),
  };
};