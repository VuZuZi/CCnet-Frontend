import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, History, Loader2, Search } from "lucide-react";

import { adminAPI } from "../api/adminAPI";
import HistorySummaryCards from "../components/notificationHistory/HistorySummaryCards";
import HistoryCard from "../components/notificationHistory/HistoryCard";
import { getNotificationHistoryStats } from "../utils/adminNotificationHistory.utils";

function LoadingState() {
  return (
    <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white py-24 shadow-sm">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
          <Loader2 size={26} className="animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading notification history...
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="rounded-[28px] border border-rose-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner">
        <History size={24} />
      </div>

      <h2 className="mt-4 text-xl font-bold text-slate-900">
        Could not load notification history
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {message ||
          "An unexpected error occurred while loading notification history."}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
        <History size={24} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        No notification history found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Sent system notifications will appear here once an admin starts sending
        them.
      </p>
    </div>
  );
}

export function AdminNotificationHistoryPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "notification-history", search],
    queryFn: async () => {
      const response = await adminAPI.getNotificationHistory({
        search: search.trim() || undefined,
      });
      return response.data?.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
  });

  const items = useMemo(() => {
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }, [data]);

  const stats = useMemo(() => getNotificationHistoryStats(items), [items]);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.18)]">
        <div className="px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/admin/notifications"
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100"
                >
                  <ArrowLeft size={16} />
                  Back to Notifications
                </Link>

                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                  <History size={14} />
                  Notification History
                </div>
              </div>

              <h1 className="mt-4 text-[28px] font-black leading-none tracking-tight text-slate-900 sm:text-[46px]">
                Notification History
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Review previously sent system notifications with recipient
                scope, sender details, message content, delivery context, and
                audit metadata.
              </p>
            </div>

            <HistorySummaryCards stats={stats} />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black tracking-tight text-slate-900">
              Search notification logs
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Search by title, message, severity, audience, sender, or delivery
              metadata.
            </p>
          </div>

          <label className="relative block w-full md:w-[440px]">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notification history..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />
          </label>
        </div>
      </section>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={
            error?.message ||
            "An unexpected error occurred while loading notification history."
          }
        />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="space-y-4">
          {items.map((item) => (
            <HistoryCard
              key={item._id || `${item.action}-${item.createdAt}`}
              item={item}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default AdminNotificationHistoryPage;