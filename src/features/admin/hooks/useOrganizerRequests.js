import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { organizerRequestAdminAPI } from "../api/organizerRequestAdminAPI";
import { ADMIN_QUERY_KEYS } from "../constants/admin.queryKeys";

export function useOrganizerRequests() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const query = useQuery({
    queryKey: ADMIN_QUERY_KEYS.organizerRequests.list(filters),
    queryFn: () => organizerRequestAdminAPI.getRequests(filters),
    placeholderData: (previousData) => previousData,
  });

  const items = useMemo(() => query.data?.items || [], [query.data]);

  const pagination = useMemo(
    () =>
      query.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    [query.data]
  );

  const updateFilters = (updater) => {
    setFilters((prev) =>
      typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
    );
  };

  const setPage = (page) => {
    updateFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  return {
    filters,
    setFilters: updateFilters,
    setPage,
    items,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useOrganizerRequests;