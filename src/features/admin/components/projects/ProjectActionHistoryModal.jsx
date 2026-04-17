import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Loader2,
  Search,
  History,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  UserCircle2,
  FileClock,
  Sparkles,
} from "lucide-react";
import { adminAPI } from "../../api/adminAPI";
import {
  PROJECT_HISTORY_ACTION_OPTIONS,
  formatProjectHistoryDateTime,
  getProjectHistoryActionBadgeClass,
  getProjectHistoryActionLabel,
  getProjectHistoryStatusLabel,
  getProjectHistoryProjectTypeLabel,
  normalizeProjectHistoryLogResponse,
} from "../../utils/projectHistory.utils";

export default function ProjectActionHistoryModal({
  open,
  project = null,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const originalOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setAction("");
    setPage(1);
  }, [open, project?._id]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "admin",
      "project-action-history",
      project?._id || "all",
      page,
      search,
      action,
      open,
    ],
    queryFn: async () => {
      const res = await adminAPI.getActionLogs({
        targetType: "project",
        ...(project?._id ? { targetId: project._id } : {}),
        page,
        limit: 8,
        search,
        action,
      });

      return normalizeProjectHistoryLogResponse(res);
    },
    enabled: Boolean(open),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  const items = data?.items || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  };

  const title = useMemo(() => {
    if (project?.title) return project.title;
    return "All Project Action Logs";
  }, [project?.title]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close history"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
      />

      <div
        className="relative z-10 flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf0_100%)] px-5 py-5 md:px-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-700 shadow-sm">
                <History size={14} />
                View History
              </div>

              <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                {project?._id ? "Project Action History" : "Project Action Logs"}
              </h3>

              <p className="mt-2 truncate text-sm text-slate-500">{title}</p>
            </div>

            <div className="flex items-center gap-3">
              {isFetching ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                  <Loader2 size={14} className="animate-spin" />
                  Refreshing...
                </div>
              ) : (
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 md:inline-flex">
                  <Sparkles size={13} className="text-amber-500" />
                  Audit trail
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by admin, reason, project..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>

            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="h-14 w-full rounded-2xl border border-amber-300 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition hover:border-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            >
              {PROJECT_HISTORY_ACTION_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50/80 p-4 md:p-6">
          {isLoading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-16 text-center shadow-sm">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-500">
                <Loader2 size={18} className="animate-spin text-amber-500" />
                Loading history...
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center shadow-sm">
              <div className="mb-3 text-4xl">🕘</div>
              <h4 className="text-lg font-bold text-slate-900">
                No history found
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                {project?._id
                  ? "No action logs are available for this project yet."
                  : "No project logs are available right now."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((log) => {
                const actionLabel = getProjectHistoryActionLabel(log.action);
                const badgeClass = getProjectHistoryActionBadgeClass(log.action);

                return (
                  <div
                    key={log._id}
                    className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md md:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-4 flex flex-wrap items-center gap-2.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${badgeClass}`}
                          >
                            {actionLabel}
                          </span>

                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                            {formatProjectHistoryDateTime(log.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                            <UserCircle2 size={20} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-base font-black text-slate-900">
                              {log.actorName || "Admin"}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {log.actorEmail || "--"}
                            </p>

                            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 md:p-5">
                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="font-semibold text-slate-500">
                                  Status change:
                                </span>

                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-bold text-slate-700 shadow-sm">
                                  {getProjectHistoryStatusLabel(log.previousStatus)}
                                </span>

                                <ArrowRight
                                  size={14}
                                  className="text-amber-500"
                                />

                                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-bold text-amber-700">
                                  {getProjectHistoryStatusLabel(log.nextStatus)}
                                </span>
                              </div>

                              <div className="mt-4">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                                  Reason
                                </p>

                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                  {log.reason || "--"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full shrink-0 xl:w-[300px]">
                        <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_100%)] p-5 shadow-sm">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                              <FileClock size={16} />
                            </div>
                            <p className="text-base font-black text-slate-900">
                              Metadata
                            </p>
                          </div>

                          <div className="space-y-4 text-sm">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                                Project
                              </p>
                              <p className="mt-1 font-semibold text-slate-800">
                                {log.projectTitle || "--"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                                Project Type
                              </p>
                              <p className="mt-1 font-semibold text-slate-700">
                                {getProjectHistoryProjectTypeLabel(log.projectType)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                                Target ID
                              </p>
                              <p className="mt-1 break-all rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500">
                                {log.targetIdString || "--"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Total logs:{" "}
              <span className="font-bold text-slate-800">
                {pagination.total || 0}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700">
                {pagination.page} / {pagination.totalPages}
              </div>

              <button
                type="button"
                onClick={() =>
                  setPage((prev) =>
                    Math.min(pagination.totalPages || 1, prev + 1)
                  )
                }
                disabled={page >= (pagination.totalPages || 1)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}