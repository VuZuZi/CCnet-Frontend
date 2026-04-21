import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";
import { projectAPI } from "../api/projectAPI";

const PROJECT_BASE_KEY = ["projects"];
const CATEGORY_VALUES = [
  "Y_TE",
  "GIAO_DUC",
  "MOI_TRUONG",
  "THIEN_TAI",
  "XAY_DUNG",
];

const FEED_BASE_KEY = ["projectFeedPosts"];

export const cleanProjectFilters = (filters = {}) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

export const PROJECT_QUERY_KEYS = {
  all: PROJECT_BASE_KEY,
  explore: (filters = {}) => [
    ...PROJECT_BASE_KEY,
    "explore",
    cleanProjectFilters(filters),
  ],
  workspace: (filters = {}) => [
    ...PROJECT_BASE_KEY,
    "workspace",
    cleanProjectFilters(filters),
  ],
  detail: (id) => [...PROJECT_BASE_KEY, "detail", id],
  draftDetail: (id) => [...PROJECT_BASE_KEY, "draft-detail", id],
  updatingDetail: (id) => [...PROJECT_BASE_KEY, "updating-detail", id],
  featured: [...PROJECT_BASE_KEY, "featured"],
  volunteerNeeded: [...PROJECT_BASE_KEY, "volunteer-needed"],
  categoryCount: (filters = {}, category) => [
    ...PROJECT_BASE_KEY,
    "category-count",
    cleanProjectFilters(filters),
    category,
  ],
};

export const PROJECT_FEED_QUERY_KEYS = {
  all: FEED_BASE_KEY,
  posts: (projectId) => [...FEED_BASE_KEY, projectId],
};

export const useExploreProjects = (filters = {}) => {
  const cleanedFilters = cleanProjectFilters(filters);

  return useInfiniteQuery({
    queryKey: PROJECT_QUERY_KEYS.explore(cleanedFilters),
    queryFn: ({ pageParam = 1 }) =>
      projectAPI.getExplore({
        ...cleanedFilters,
        page: pageParam,
        limit: 9,
      }),
    getNextPageParam: (lastPage) => {
      const currentPage = Number(lastPage?.pagination?.currentPage || 1);
      const totalPages = Number(lastPage?.pagination?.totalPages || 1);

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useProjectDetail = (id) =>
  useQuery({
    queryKey: PROJECT_QUERY_KEYS.detail(id),
    queryFn: () => projectAPI.getDetail(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });

export const useProjectDraftDetail = (id) =>
  useQuery({
    queryKey: PROJECT_QUERY_KEYS.draftDetail(id),
    queryFn: () => projectAPI.getDraftDetail(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });

export const useUpdatingProjectDetail = (id) =>
  useQuery({
    queryKey: PROJECT_QUERY_KEYS.updatingDetail(id),
    queryFn: () => projectAPI.getUpdatingDetail(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });

export const useFeaturedProject = () =>
  useQuery({
    queryKey: PROJECT_QUERY_KEYS.featured,
    queryFn: async () => {
      const result = await projectAPI.getFeatured();

      if (Array.isArray(result)) return result[0] || null;
      if (result?.project) return result.project;
      return result || null;
    },
    staleTime: 3 * 60 * 1000,
  });

export const useVolunteerNeededProjects = () =>
  useQuery({
    queryKey: PROJECT_QUERY_KEYS.volunteerNeeded,
    queryFn: () => projectAPI.getVolunteerNeeded(),
    staleTime: 3 * 60 * 1000,
  });

export const useProjectCategoryCounts = (filters = {}) => {
  const baseFilters = cleanProjectFilters(
    Object.fromEntries(
      Object.entries(filters).filter(([key]) => key !== "category"),
    ),
  );

  const queries = useQueries({
    queries: CATEGORY_VALUES.map((category) => ({
      queryKey: PROJECT_QUERY_KEYS.categoryCount(baseFilters, category),
      queryFn: async () => {
        const result = await projectAPI.getExplore({
          ...baseFilters,
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

export const useWorkspaceProjects = (filters = {}) => {
  const cleanedFilters = cleanProjectFilters(filters);

  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.workspace(cleanedFilters),
    queryFn: () => projectAPI.getWorkspaceProjects(cleanedFilters),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};
