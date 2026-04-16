import { useMemo } from "react";
import { ChevronLeft, ChevronRight, FileClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OrganizerRequestFilters from "../components/organizerRequest/OrganizerRequestFilters";
import OrganizerRequestTable from "../components/organizerRequest/OrganizerRequestTable";
import { useOrganizerRequests } from "../hooks/useOrganizerRequests";
import AdminHistoryButton from "@/features/admin/components/AdminHistoryButton";

const buildVisiblePages = (current, total) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3) return [1, 2, 3, 4, total];
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total];

  return [1, current - 1, current, current + 1, total];
};

const StatCard = ({ label, value, className = "" }) => (
  <div
    className={`rounded-[22px] border px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
  >
    <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
      {label}
    </p>
    <p className="mt-2 text-[30px] font-black leading-none">{value}</p>
  </div>
);

export function OrganizerRequestsPage() {
  const navigate = useNavigate();
  const { filters, setFilters, setPage, items, isLoading, isFetching, pagination } =
    useOrganizerRequests();

  const totalPages = Math.max(1, pagination.totalPages || 1);
  const visiblePages = buildVisiblePages(pagination.page, totalPages);

  const stats = useMemo(() => {
    const pending = items.filter((item) => item.status === "PENDING").length;
    const approved = items.filter((item) => item.status === "APPROVED").length;
    const declined = items.filter((item) => item.status === "DECLINED").length;

    return {
      total: pagination.total || 0,
      pending,
      approved,
      declined,
    };
  }, [items, pagination.total]);

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
              <FileClock size={11} />
              Admin Organizer Review
            </div>

            <h1 className="text-[28px] font-black leading-none tracking-tight text-slate-900">
              Organizer Requests
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Review and manage organizer upgrade applications with a clean and
              traceable moderation flow.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <AdminHistoryButton
              onClick={() => navigate("/admin/organizer-action-logs")}
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[460px]">
              <StatCard
                label="Total"
                value={stats.total}
                className="border-slate-200 bg-slate-50 text-slate-700"
              />
              <StatCard
                label="Pending"
                value={stats.pending}
                className="border-amber-200 bg-amber-50 text-amber-700"
              />
              <StatCard
                label="Approved"
                value={stats.approved}
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
              />
              <StatCard
                label="Declined"
                value={stats.declined}
                className="border-rose-200 bg-rose-50 text-rose-700"
              />
            </div>
          </div>
        </div>
      </div>

      <OrganizerRequestFilters filters={filters} setFilters={setFilters} />

      <OrganizerRequestTable items={items} isLoading={isLoading} />

      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-500">
            <span>
              Page {pagination.page} / {totalPages}
            </span>
            <span className="mx-2">•</span>
            <span>Total requests: {pagination.total}</span>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1 || isFetching}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  disabled={isFetching}
                  className={`inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                    pagination.page === pageNumber
                      ? "bg-amber-500 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  } disabled:opacity-50`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setPage(Math.min(totalPages, pagination.page + 1))
                }
                disabled={pagination.page === totalPages || isFetching}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default OrganizerRequestsPage;