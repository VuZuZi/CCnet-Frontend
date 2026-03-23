import { useEffect, useMemo, useState } from 'react';
import { CircleAlert } from 'lucide-react';

import { useHelpRequests } from '../hooks/useHelpRequestQueries';
import { useHelpRequestFilters } from '../hooks/useHelpRequestFilters';
import { HelpRequestHeader } from '../components/HelpRequestHeader';
import { HelpRequestFilterBar } from '../components/HelpRequestFilterBar';
import { HelpRequestList } from '../components/HelpRequestList';

export function NeedHelpPage() {
  const [page, setPage] = useState(1);

  const {
    filters,
    localSearch,
    setLocalSearch,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  } = useHelpRequestFilters();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useHelpRequests(filters, page, 12);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { loadedCount, totalCount } = useMemo(() => {
    const requests = data?.data || [];

    return {
      loadedCount: requests.length,
      totalCount: data?.pagination?.total || requests.length,
    };
  }, [data]);

  if (isError) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <CircleAlert size={28} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">Something went wrong</h2>
          <p className="mb-4 text-slate-500">
            {error?.message || 'Failed to load help requests. Please try again.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-amber-500"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6 sm:p-8">
          <HelpRequestHeader loadedCount={loadedCount} totalCount={totalCount} />
        </div>

        <div className="p-6 sm:p-8">
          <HelpRequestFilterBar
            localSearch={localSearch}
            setLocalSearch={setLocalSearch}
            filters={filters}
            onFilterChange={updateFilter}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        </div>
      </section>

      <section className="mt-6">
        <HelpRequestList
          data={data}
          page={page}
          onPageChange={setPage}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      </section>
    </main>
  );
}

export default NeedHelpPage;
