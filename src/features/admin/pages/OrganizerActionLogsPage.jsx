import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  History,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";
import { organizerRequestAdminAPI } from "../api/organizerRequestAdminAPI";
import { ADMIN_QUERY_KEYS } from "../constants/admin.queryKeys";

const PAGE_SIZE = 10;

const ACTION_LABELS = {
  APPROVE_ORGANIZER_REQUEST: "Approve request",
  DECLINE_ORGANIZER_REQUEST: "Decline request",
};

const ACTION_STYLES = {
  APPROVE_ORGANIZER_REQUEST:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  DECLINE_ORGANIZER_REQUEST: "border-rose-200 bg-rose-50 text-rose-700",
};

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "APPROVE_ORGANIZER_REQUEST", label: "Approve request" },
  { value: "DECLINE_ORGANIZER_REQUEST", label: "Decline request" },
];

const getActionIcon = (action) => {
  switch (action) {
    case "APPROVE_ORGANIZER_REQUEST":
      return <CheckCircle2 size={14} />;
    case "DECLINE_ORGANIZER_REQUEST":
      return <Clock3 size={14} />;
    default:
      return <History size={14} />;
  }
};

const formatDateTimeSingleLine = (value) => {
  if (!value) return "--";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

const buildVisiblePages = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, total];
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total];
  return [1, current - 1, current, current + 1, total];
};

const normalizeLogsResponse = (payload) => ({
  items: payload?.items || [],
  pagination: payload?.pagination || {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  },
});

const StatCard = ({ label, value, className = "" }) => (
  <div
    className={`rounded-[22px] border px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
  >
    <p className="text-[10px] font-bold uppercase tracking-[0.14em]">{label}</p>
    <p className="mt-2 text-[30px] font-black leading-none">{value}</p>
  </div>
);

export function OrganizerActionLogsPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchText(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: searchText,
      action: actionFilter,
    }),
    [page, searchText, actionFilter]
  );

  const logsQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.organizerActionLogs.list(params),
    queryFn: async () => {
      const res = await organizerRequestAdminAPI.getActionLogs(params);
      return normalizeLogsResponse(res);
    },
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    staleTime: 0,
  });

  const { items, pagination } = logsQuery.data || {
    items: [],
    pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  };

  const stats = useMemo(() => {
    return {
      total: pagination.total || 0,
      approved: items.filter(
        (item) => item.action === "APPROVE_ORGANIZER_REQUEST"
      ).length,
      declined: items.filter(
        (item) => item.action === "DECLINE_ORGANIZER_REQUEST"
      ).length,
    };
  }, [items, pagination.total]);

  const totalPages = Math.max(1, pagination.totalPages || 1);
  const visiblePages = buildVisiblePages(page, totalPages);

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex-1">
            <button
              type="button"
              onClick={() => navigate("/admin/organizers")}
              className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
            >
              <ArrowLeft size={16} />
              Back to Organizer Requests
            </button>

            <h1 className="text-[34px] font-black leading-none tracking-tight text-slate-900">
              Organizer Action Logs
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <StatCard
              label="Total"
              value={stats.total}
              className="border-slate-200 bg-slate-50 text-slate-700"
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

      <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col gap-3 md:flex-row xl:w-auto">
            <div className="relative w-full xl:w-[320px]">
              <Filter
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              >
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full xl:w-[420px]">
              <Search
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by admin, applicant, email, organization..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[20px] font-black text-slate-900">
                Organizer Moderation Timeline
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Page {page} / {totalPages}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500">
              Showing {items.length} log(s) on this page
            </div>
          </div>
        </div>

        <div className="min-h-[460px] overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-slate-50/90">
              <tr className="text-left text-slate-500">
                <th className="w-[18%] px-6 py-4 font-bold">Action</th>
                <th className="w-[18%] px-6 py-4 font-bold">Admin</th>
                <th className="w-[18%] px-6 py-4 font-bold">Applicant</th>
                <th className="w-[18%] px-6 py-4 font-bold">Organization</th>
                <th className="w-[16%] px-6 py-4 font-bold">Reason</th>
                <th className="w-[12%] px-6 py-4 font-bold">Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {logsQuery.isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 shadow-sm">
                      <Loader2 size={18} className="animate-spin text-amber-500" />
                      Loading organizer action logs...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <History size={24} />
                      </div>
                      <p className="mt-5 text-base font-bold text-slate-700">
                        No organizer action logs found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((log) => {
                  const actionLabel =
                    ACTION_LABELS[log.action] || log.action || "Unknown action";
                  const actionStyle =
                    ACTION_STYLES[log.action] ||
                    "border-slate-200 bg-slate-100 text-slate-700";

                  return (
                    <tr key={log._id} className="transition hover:bg-amber-50/20">
                      <td className="px-6 py-5 align-top">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${actionStyle}`}
                        >
                          {getActionIcon(log.action)}
                          {actionLabel}
                        </span>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-2 text-[15px] font-black text-slate-900">
                            <UserRound size={14} className="text-slate-400" />
                            <span>{log.actorName || log.actorEmail || "--"}</span>
                          </div>
                          <div className="break-all text-sm text-slate-500">
                            {log.actorEmail || "--"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="space-y-1">
                          <div className="text-[15px] font-black text-slate-900">
                            {log.applicantName || "--"}
                          </div>
                          <div className="break-all text-sm text-slate-500">
                            {log.applicantEmail || "--"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                          {log.organizationName || "--"}
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                          {log.reason || "No reason provided."}
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">
                          {formatDateTimeSingleLine(log.createdAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-5">
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || logsQuery.isFetching}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  disabled={logsQuery.isFetching}
                  className={`inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                    page === pageNumber
                      ? "bg-amber-500 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  } disabled:opacity-50`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || logsQuery.isFetching}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
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

export default OrganizerActionLogsPage;