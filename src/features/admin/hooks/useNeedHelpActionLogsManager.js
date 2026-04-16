import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../api/adminAPI";
import { ADMIN_QUERY_KEYS } from "../constants/admin.queryKeys";
import {
  ADMIN_ACTION_LOG_PAGE_SIZE,
  buildVisiblePages,
  normalizeLogsResponse,
} from "../utils/adminActionLog.utils";

export function useNeedHelpActionLogsManager() {
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

  const logListParams = useMemo(
    () => ({
      page,
      limit: ADMIN_ACTION_LOG_PAGE_SIZE,
      search: searchText,
      action: actionFilter,
      targetType: "help_request",
    }),
    [page, searchText, actionFilter]
  );

  const logsQuery = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.actionLogs.list(logListParams), "need-help"],
    queryFn: async () => {
      const res = await adminAPI.getActionLogs(logListParams);
      return normalizeLogsResponse(res, ADMIN_ACTION_LOG_PAGE_SIZE);
    },
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    staleTime: 0,
  });

  const { items, pagination } = logsQuery.data || {
    items: [],
    pagination: {
      page: 1,
      limit: ADMIN_ACTION_LOG_PAGE_SIZE,
      total: 0,
      totalPages: 1,
    },
  };

  const stats = useMemo(
    () => ({
      total: pagination?.total || 0,
      verified: items.filter((item) => item.action === "HELP_REQUEST_VERIFIED").length,
      rejected: items.filter((item) => item.action === "HELP_REQUEST_REJECTED").length,
      assigned: items.filter((item) =>
        ["HELP_REQUEST_ASSIGNED", "HELP_REQUEST_REASSIGNED"].includes(item.action)
      ).length,
    }),
    [items, pagination]
  );

  const totalPages = Math.max(1, pagination?.totalPages || 1);
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
    setActionFilter,
    handleActionFilterChange,
    logsQuery,
    items,
    pagination,
    stats,
    totalPages,
    visiblePages,
  };
}

export default useNeedHelpActionLogsManager;