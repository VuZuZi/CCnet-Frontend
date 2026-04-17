import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Flame,
  Loader2,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

import { useHelpRequests } from "../hooks/useHelpRequestQueries";
import { AdminNeedHelpFilters } from "../components/admin/AdminNeedHelpFilters";
import { AdminNeedHelpHorizontalList } from "../components/admin/AdminNeedHelpHorizontalList";
import AdminHistoryButton from "@/features/admin/components/AdminHistoryButton";

function SummaryCard({ icon: Icon, label, value, tone = "slate" }) {
  const toneMap = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={`h-full min-h-[132px] rounded-[24px] border px-5 py-4 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.22)] ${
        toneMap[tone] || toneMap.slate
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <p className="min-h-[40px] max-w-[110px] text-[11px] font-bold uppercase tracking-[0.16em] leading-5 text-slate-500">
            {label}
          </p>

          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Icon size={18} />
          </div>
        </div>

        <p className="mt-3 text-[40px] font-black leading-none tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function PaginationBar({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const currentPage = pagination.page || 1;
  const totalPages = pagination.totalPages || 1;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 pt-4">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!pagination.hasPrev}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft size={16} />
        Trước
      </button>

      <div className="flex flex-wrap items-center gap-2">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition-colors ${
              page === currentPage
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!pagination.hasNext}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Tiếp
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function AdminNeedHelpRequestsPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    urgencyLevel: "",
    page: 1,
    limit: 8,
  });

  const { data, isLoading } = useHelpRequests(
    filters,
    filters.page,
    filters.limit
  );
  const items = data?.data || [];
  const pagination = data?.pagination;

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "PENDING") acc.pending += 1;
        if (item.status === "VERIFIED") acc.verified += 1;
        if (item.status === "IN_PROGRESS") acc.inProgress += 1;
        if (
          item.urgencyLevel === "HIGH" ||
          item.urgencyLevel === "CRITICAL"
        ) {
          acc.priority += 1;
        }
        return acc;
      },
      {
        total: 0,
        pending: 0,
        verified: 0,
        inProgress: 0,
        priority: 0,
      }
    );
  }, [items]);

  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.18)]">
        <div className="px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                <Sparkles size={14} />
                Kiểm duyệt NeedHelp của Admin
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-[46px]">
                Yêu cầu trợ giúp
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Kiểm duyệt các yêu cầu được gửi, điều chỉnh trạng thái xuất bản và 
                gán nhà tổ chức phù hợp với quy trình làm việc nhanh hơn và sạch sẽ hơn.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 xl:min-w-[520px]">
              <AdminHistoryButton to="/admin/need-help-action-logs" />

              <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  icon={ClipboardList}
                  label="Được tải trên trang"
                  value={summary.total}
                  tone="slate"
                />
                <SummaryCard
                  icon={ShieldCheck}
                  label="Chờ kiểm duyệt"
                  value={summary.pending}
                  tone="amber"
                />
                <SummaryCard
                  icon={TimerReset}
                  label="Đã xác minh"
                  value={summary.verified}
                  tone="sky"
                />
                <SummaryCard
                  icon={Flame}
                  label="Ưu tiên cao"
                  value={summary.priority}
                  tone="emerald"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdminNeedHelpFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white py-20 shadow-sm">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-amber-500" size={34} />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Đang tải các yêu cầu trợ giúp...
            </p>
          </div>
        </div>
      ) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Danh mục yêu cầu
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Trang {pagination?.page || 1}
                {pagination?.totalPages ? ` / ${pagination.totalPages}` : ""}
              </p>
            </div>

            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              Hiển thị {items.length} yêu cầu trên trang này
            </div>
          </div>

          <div className="max-h-[calc(100vh-360px)] overflow-y-auto pr-1">
            <AdminNeedHelpHorizontalList items={items} />
          </div>

          <PaginationBar
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </section>
      )}
    </div>
  );
}

export default AdminNeedHelpRequestsPage;