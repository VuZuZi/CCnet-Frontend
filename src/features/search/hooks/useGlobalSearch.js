import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { searchAPI } from "../api/searchAPI";
import { buildSearchGroups } from "../utils/search.normalize";
import { searchKeys } from "../utils/search.queryKeys";

export function useGlobalSearch({ debounceMs = 180, limit = 8 } = {}) {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(String(query || "").trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const enabled = isAuthenticated && debounced.length > 0;

  const searchQuery = useQuery({
    queryKey: searchKeys.navbar({
      query: debounced,
      limit,
    }),
    queryFn: () =>
      searchAPI.globalSearch({
        q: debounced,
        limit,
        type: "navbar",
        includeCounts: true,
      }),
    enabled,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  const groups = useMemo(() => {
    return buildSearchGroups(searchQuery.data?.groups || {});
  }, [searchQuery.data]);

  return {
    query,
    setQuery,
    groups,
    isAuthenticated,
    isLoading: searchQuery.isLoading,
    isFetching: searchQuery.isFetching,
    isError: searchQuery.isError,
    error: searchQuery.error,
  };
}

export default useGlobalSearch;