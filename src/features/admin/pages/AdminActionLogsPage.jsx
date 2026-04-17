import { useNavigate } from "react-router-dom";
import { useAdminActionLogsManager } from "../hooks/useAdminActionLogsManager";
import { getErrorMessage } from "../utils/adminActionLog.utils";
import ActionLogsHeader from "../components/actionLogs/ActionLogsHeader";
import ActionLogsFilters from "../components/actionLogs/ActionLogsFilters";
import ActionLogsTable from "../components/actionLogs/ActionLogsTable";

function AdminActionLogsPage() {
  const navigate = useNavigate();

  const {
    page,
    setPage,
    searchInput,
    setSearchInput,
    actionFilter,
    handleActionFilterChange,
    logsQuery,
    items,
    stats,
    totalPages,
    visiblePages,
  } = useAdminActionLogsManager();

  return (
    <div className="space-y-5">
      <ActionLogsHeader
        stats={stats}
        onBack={() => navigate("/admin/users")}
      />

      <ActionLogsFilters
        actionFilter={actionFilter}
        onActionFilterChange={handleActionFilterChange}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
      />

      <ActionLogsTable
        items={items}
        isLoading={logsQuery.isLoading}
        isFetching={logsQuery.isFetching}
        page={page}
        totalPages={totalPages}
        visiblePages={visiblePages}
        onPageChange={setPage}
      />

      {logsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">
          {getErrorMessage(logsQuery.error, "Tải lịch sử hành động thất bại.")}
        </div>
      ) : null}
    </div>
  );
}

export default AdminActionLogsPage;