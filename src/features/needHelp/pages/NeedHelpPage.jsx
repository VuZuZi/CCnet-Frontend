import { useCallback, useMemo, useState } from 'react';
import {
  CircleAlert,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

import { useHelpRequests } from '../hooks/useHelpRequestQueries';
import { useHelpRequestFilters } from '../hooks/useHelpRequestFilters';
import { NeedHelpDiscoverySections } from '../components/NeedHelpDiscoverySections';
import { HelpRequestFilterBar } from '../components/HelpRequestFilterBar';
import { HelpRequestList } from '../components/HelpRequestList';

export function NeedHelpPage() {
  const [pageState, setPageState] = useState({ value: 1, filterKey: null });

  const {
    filters,
    localSearch,
    setLocalSearch,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  } = useHelpRequestFilters();

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const page = pageState.filterKey === filterKey ? pageState.value : 1;

  const {
    data,
    isLoading,
    isError,
    error,
  } = useHelpRequests(filters, page, 15);
  const items = data?.data || [];
  const pagination = data?.pagination;

  const handlePageChange = (nextPage) => {
    setPageState({ value: nextPage, filterKey });
  };

  const scrollToRequestSection = useCallback(() => {
    const requestListSection = document.getElementById('need-help-request-list');
    requestListSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (isError) {
    return (
      <main className="min-h-screen bg-[#f8f7f3]">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm sm:px-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <CircleAlert size={28} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Đã xảy ra sự cố</h2>
            <p className="mb-4 text-slate-500">
              {error?.message || 'Không thể tải yêu cầu trợ giúp. Vui lòng thử lại.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-amber-500"
            >
              Thử lại
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f3]">
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <NeedHelpDiscoverySections
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onJumpToList={scrollToRequestSection}
        />

        <section id="need-help-request-list" className="mt-6 space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <HelpRequestFilterBar
              localSearch={localSearch}
              setLocalSearch={setLocalSearch}
              filters={filters}
              onFilterChange={updateFilter}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
              onCreateClick={scrollToRequestSection}
            />
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                  <Sparkles size={12} />
                  Danh sách phù hợp
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                  Yêu cầu đang mở
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Trang {pagination?.page || 1}
                  {pagination?.totalPages ? ` / ${pagination.totalPages}` : ''} với {items.length}{' '}
                  yêu cầu đang hiển thị.
                </p>
              </div>

              {hasActiveFilters ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <TriangleAlert size={16} className="text-amber-500" />
                  Đang áp dụng bộ lọc tìm kiếm
                </div>
              ) : null}
            </div>

            <HelpRequestList
              data={data}
              page={page}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
            />
          </section>
        </section>
      </div>
    </main>
  );
}

export default NeedHelpPage;
