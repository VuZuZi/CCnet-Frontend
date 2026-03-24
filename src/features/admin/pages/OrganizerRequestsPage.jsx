import OrganizerRequestFilters from "../components/organizerRequest/OrganizerRequestFilters";
import OrganizerRequestTable from "../components/organizerRequest/OrganizerRequestTable";
import { useOrganizerRequests } from "../hooks/useOrganizerRequests";

export function OrganizerRequestsPage() {
  const { filters, setFilters, items, isLoading, pagination } = useOrganizerRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Organizer Requests</h1>
        <p className="mt-2 text-sm text-slate-500">
          Review and manage organizer upgrade applications.
        </p>
      </div>

      <OrganizerRequestFilters filters={filters} setFilters={setFilters} />

      <OrganizerRequestTable items={items} isLoading={isLoading} />

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Page {pagination.page} / {pagination.totalPages}
        </span>
        <span>Total requests: {pagination.total}</span>
      </div>
    </div>
  );
}

export default OrganizerRequestsPage;