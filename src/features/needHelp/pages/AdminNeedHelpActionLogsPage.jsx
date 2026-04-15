import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ClipboardList,
  History,
  Loader2,
  Search,
  ShieldCheck,
} from 'lucide-react';

import httpClient from '@/shared/lib/httpClient';
import { useDebounce } from '@/shared/hooks/useDebounce';

const ACTION_STYLES = {
  HELP_REQUEST_ASSIGNED: 'bg-amber-50 text-amber-700 border-amber-200',
  HELP_REQUEST_REASSIGNED: 'bg-orange-50 text-orange-700 border-orange-200',
  HELP_REQUEST_VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  HELP_REQUEST_REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  HELP_REQUEST_STATUS_UPDATED: 'bg-sky-50 text-sky-700 border-sky-200',
  HELP_REQUEST_LINKED_PROJECT: 'bg-violet-50 text-violet-700 border-violet-200',
};

function formatLogDate(value) {
  if (!value) return 'Unknown time';

  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getActionLabel(action = '') {
  const map = {
    HELP_REQUEST_ASSIGNED: 'Assigned',
    HELP_REQUEST_REASSIGNED: 'Reassigned',
    HELP_REQUEST_VERIFIED: 'Verified',
    HELP_REQUEST_REJECTED: 'Rejected',
    HELP_REQUEST_STATUS_UPDATED: 'Status Updated',
    HELP_REQUEST_LINKED_PROJECT: 'Linked Project',
  };

  return map[action] || action || 'Unknown';
}

function LogCard({ log }) {
  const actorName =
    log?.actorId?.fullName ||
    log?.metadata?.actorName ||
    log?.metadata?.adminName ||
    'Admin';

  const targetTitle =
    log?.metadata?.title ||
    log?.metadata?.helpRequestTitle ||
    log?.metadata?.requestTitle ||
    'NeedHelp request';

  const actionClass =
    ACTION_STYLES[log?.action] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${actionClass}`}
            >
              {getActionLabel(log?.action)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {formatLogDate(log?.createdAt)}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
            {targetTitle}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Action by <span className="font-semibold text-slate-700">{actorName}</span>
          </p>
        </div>

        {log?.targetId ? (
          <Link
            to={`/admin/need-help/${log.targetId}`}
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Open Request
          </Link>
        ) : null}
      </div>

      {(log?.reason || log?.message) && (
        <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Reason / Note
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {log.reason || log.message}
          </p>
        </div>
      )}

      {(log?.previousState || log?.nextState) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Previous State
            </p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-700">
              {JSON.stringify(log.previousState || {}, null, 2)}
            </pre>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Next State
            </p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-700">
              {JSON.stringify(log.nextState || {}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </article>
  );
}

export function AdminNeedHelpActionLogsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'need-help-action-logs', debouncedSearch],
    queryFn: async () => {
      const response = await httpClient.get('/admin/action-logs', {
        params: {
          search: debouncedSearch || undefined,
          targetType: 'help_request',
          limit: 50,
        },
      });

      return response.data?.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
  });

  const logs = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.logs)) return data.logs;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.18)]">
        <div className="px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <Link
                to="/admin/need-help"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft size={14} />
                Back to NeedHelp
              </Link>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                <History size={14} />
                NeedHelp Action Logs
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-[46px]">
                NeedHelp History
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Review admin actions performed on NeedHelp requests for traceability and moderation history.
              </p>
            </div>

            <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:w-[360px]">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.22)]">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Loaded Logs
                  </p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <ClipboardList size={18} />
                  </div>
                </div>
                <p className="mt-3 text-[40px] font-black leading-none tracking-tight text-slate-900">
                  {logs.length}
                </p>
              </div>

              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.22)]">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Traceability
                  </p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <p className="mt-3 text-lg font-bold text-slate-900">
                  Live moderation history
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <label className="relative block">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, admin, or reason..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
          />
        </label>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white py-20 shadow-sm">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-amber-500" size={34} />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading need help action logs...
            </p>
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-[28px] border border-rose-200 bg-white px-6 py-14 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Could not load logs</h2>
          <p className="mt-2 text-sm text-slate-500">
            {error?.message || 'An unexpected error occurred while loading action logs.'}
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <History size={24} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No NeedHelp logs found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            When admin actions are recorded for NeedHelp moderation, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <LogCard key={log._id || `${log.action}-${log.createdAt}`} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminNeedHelpActionLogsPage;