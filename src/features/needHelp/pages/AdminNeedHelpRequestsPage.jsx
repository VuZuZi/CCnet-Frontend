import { useState } from 'react';

import { useHelpRequests } from '../hooks/useHelpRequestQueries';
import { AdminNeedHelpFilters } from '../components/admin/AdminNeedHelpFilters';
import { AdminNeedHelpHorizontalList } from '../components/admin/AdminNeedHelpHorizontalList';

export function AdminNeedHelpRequestsPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    urgencyLevel: '',
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useHelpRequests(filters, filters.page, filters.limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Need Help Requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review all requests, open details, and assign organizers.
        </p>
      </div>

      <AdminNeedHelpFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading requests...
        </div>
      ) : (
        <AdminNeedHelpHorizontalList items={data?.data || []} />
      )}
    </div>
  );
}

export default AdminNeedHelpRequestsPage;
