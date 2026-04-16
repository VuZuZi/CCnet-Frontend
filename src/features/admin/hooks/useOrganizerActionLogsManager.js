import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { organizerRequestAdminAPI } from "../api/organizerRequestAdminAPI";
import { ADMIN_QUERY_KEYS } from "../constants/admin.queryKeys";
import {
  PAGE_SIZE,
  buildVisiblePages,
  normalizeLogsResponse,
} from "../utils/organizerActionLog.utils";

export default function useOrganizerActionLogsManager() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchText(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: searchText,
      action: actionFilter,
    }),
    [page, searchText, actionFilter]
  );

  const logsQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.organizerActionLogs.list(params),
    queryFn: async () => {
      const res = await organizerRequestAdminAPI.getActionLogs(params);
      return normalizeLogsResponse(res);
    },
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    staleTime: 0,
  });

  const { items, pagination } = logsQuery.data || {
    items: [],
    pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  };

  const stats = useMemo(() => {
    return {
      total: pagination.total || 0,
      approved: items.filter(
        (item) => item.action === "APPROVE_ORGANIZER_REQUEST"
      ).length,
      declined: items.filter(
        (item) => item.action === "DECLINE_ORGANIZER_REQUEST"
      ).length,
    };
  }, [items, pagination.total]);

  const totalPages = Math.max(1, pagination.totalPages || 1);
  const visiblePages = buildVisiblePages(page, totalPages);

  const handleActionFilterChange = (value) => {
    setActionFilter(value);
    setPage(1);
  };

  return {
    page,
    setPage,
    searchInput,
    setSearchInput,
    actionFilter,
    handleActionFilterChange,
    logsQuery,
    items,
    pagination,
    stats,
    totalPages,
    visiblePages,
  };
}