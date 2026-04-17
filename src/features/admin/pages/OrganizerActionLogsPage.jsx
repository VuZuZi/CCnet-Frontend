import { useNavigate } from "react-router-dom";
import useOrganizerActionLogsManager from "../hooks/useOrganizerActionLogsManager";
import OrganizerActionLogsHeader from "../components/organizerRequest/OrganizerActionLogsHeader";
import OrganizerActionLogsFilters from "../components/organizerRequest/OrganizerActionLogsFilters";
import OrganizerActionLogsTable from "../components/organizerRequest/OrganizerActionLogsTable";

export default function OrganizerActionLogsPage() {
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
  } = useOrganizerActionLogsManager();

  return (
    <div className="space-y-5">
      <OrganizerActionLogsHeader
        stats={stats}
        onBack={() => navigate("/admin/organizers")}
      />

      <OrganizerActionLogsFilters
        actionFilter={actionFilter}
        onActionFilterChange={handleActionFilterChange}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
      />

      <OrganizerActionLogsTable
        items={items}
        isLoading={logsQuery.isLoading}
        isFetching={logsQuery.isFetching}
        page={page}
        totalPages={totalPages}
        visiblePages={visiblePages}
        onPageChange={setPage}
      />
    </div>
  );
}