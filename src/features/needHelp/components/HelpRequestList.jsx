import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileSearch, Loader2, Plus } from 'lucide-react';
import HelpRequestCard from './HelpRequestCard';

export function HelpRequestList({
  data,
  page,
  onPageChange,
  isLoading,
  hasActiveFilters,
  onResetFilters,
}) {
  const helpRequests = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || page || 1;

  const pageNumbers = useMemo(() => {
    if (!totalPages || totalPages <= 1) return [];

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index
    );
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white py-24 shadow-sm">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  if (helpRequests.length === 0) {
    return (
      <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-white py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FileSearch size={28} />
        </div>

        <p className="mb-2 text-lg font-medium text-slate-500">Không tìm thấy yêu cầu trợ giúp</p>

        <p className="mb-4 text-sm text-slate-400">
          {hasActiveFilters
            ? 'Hãy thử điều chỉnh bộ lọc để xem thêm kết quả.'
            : 'Hãy là người đầu tiên tạo yêu cầu trợ giúp!'}
        </p>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-full bg-slate-100 px-6 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Xóa bộ lọc
          </button>
        ) : (
          <Link
            to="/need-help/create"
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2 font-semibold text-slate-900 transition-colors hover:bg-amber-500"
          >
            <Plus size={18} />
            Tạo yêu cầu
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {helpRequests.map((helpRequest) => (
          <HelpRequestCard key={helpRequest._id} helpRequest={helpRequest} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Trước
          </button>

          <div className="flex flex-wrap items-center gap-1">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition-colors ${
                  pageNumber === currentPage
                    ? 'bg-amber-400 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tiếp
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default HelpRequestList;