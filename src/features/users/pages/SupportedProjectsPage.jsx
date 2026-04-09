import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  BadgeCheck,
  BadgeX,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  CircleDashed,
  FolderKanban,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';

import { useSupportedProjects } from '@/features/volunteer/hooks/useSupportedProjects';

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'JOINED', label: 'Joined' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending Review' },
  { value: 'REJECTED', label: 'Rejected' },
];

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop';

const STATUS_CONFIG = {
  JOINED: {
    label: 'Joined',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: BadgeCheck,
  },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: Sparkles,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-violet-100 text-violet-800 border-violet-200',
    icon: CircleCheckBig,
  },
  PENDING: {
    label: 'Pending review',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: CircleDashed,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: BadgeX,
  },
};

function formatDate(dateLike) {
  if (!dateLike) return 'Not available';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateLike));
  } catch {
    return 'Not available';
  }
}

function getStatusMeta(item) {
  return STATUS_CONFIG[item.derivedStatus] || STATUS_CONFIG.PENDING;
}

function SummaryCard({ label, value, hint, icon: Icon, tone = 'emerald' }) {
  const toneClasses = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    sky: 'bg-sky-50 text-sky-800 border-sky-100',
    violet: 'bg-violet-50 text-violet-800 border-violet-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    rose: 'bg-rose-50 text-rose-800 border-rose-100',
  };

  return (
    <div className={`rounded-3xl border p-5 ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">{label}</p>
          <p className="mt-3 text-3xl font-black leading-none">{value}</p>
          <p className="mt-2 text-sm opacity-75">{hint}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-3">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ item }) {
  const project = item.project;
  const statusMeta = getStatusMeta(item);
  const StatusIcon = statusMeta.icon;

  if (!project) return null;

  return (
    <article
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition-colors duration-150 hover:bg-slate-50"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '260px' }}
    >
      <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="relative min-h-[220px] bg-slate-100">
          <img
            src={project.coverMedia?.url || FALLBACK_COVER}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
            {project.category || 'Project'}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
              <StatusIcon size={12} />
              {statusMeta.label}
            </div>
            <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {project.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">{project.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {project.organizer?.fullName ? `Organizer: ${project.organizer.fullName}` : 'Organizer information not available.'}
              </p>
            </div>
            <Link
              to={`/projects/${project.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open project
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Application status</p>
              <p className="mt-2 text-sm font-bold text-slate-800">{item.applicationStatus}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Applied at</p>
              <p className="mt-2 text-sm font-bold text-slate-800">{formatDate(item.appliedAt)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Location</p>
              <p className="mt-2 text-sm font-bold text-slate-800 line-clamp-1">{project.location?.address || 'Not specified'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Timeline</p>
              <p className="mt-2 text-sm font-bold text-slate-800 line-clamp-1">
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </p>
            </div>
          </div>

          {item.rejectReason ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <strong>Reject reason:</strong> {item.rejectReason}
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                <MapPin size={12} />
                {project.location?.address || 'Location unavailable'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                <CalendarDays size={12} />
                {item.derivedStatus}
              </span>
            </div>
            <Link
              to={`/projects/${project.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800"
            >
              View details
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function SupportedProjectsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    setPage(1);
  }, [view, search]);

  const queryParams = useMemo(
    () => ({
      view,
      search,
      page,
      limit,
    }),
    [view, search, page],
  );

  const { data, isLoading, isFetching, isError } = useSupportedProjects(queryParams, true);

  const items = data?.data || [];
  const summary = data?.summary || {
    totalSupported: 0,
    joined: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
  };
  const pagination = data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back to profile
            </button>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Supported Projects</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Track every volunteer application, see which projects are approved, pending, rejected, or already in progress, and jump straight to the project detail page.
            </p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Real count</p>
            <p className="mt-2 text-3xl font-black text-emerald-900">{summary.totalSupported}</p>
            <p className="mt-1 text-sm text-slate-500">projects supported</p>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Supported" value={summary.totalSupported} hint="Approved applications" icon={BadgeCheck} tone="emerald" />
          <SummaryCard label="In progress" value={summary.inProgress} hint="Approved and active" icon={TrendingUp} tone="sky" />
          <SummaryCard label="Pending" value={summary.pending} hint="Waiting for review" icon={CircleDashed} tone="amber" />
          <SummaryCard label="Completed" value={summary.completed} hint="Projects finished" icon={CircleCheckBig} tone="violet" />
          <SummaryCard label="Rejected" value={summary.rejected} hint="Applications declined" icon={XCircle} tone="rose" />
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Project history</h2>
              <p className="mt-1 text-sm text-slate-500">Filter by status or search by title, category, and location.</p>
            </div>
            <label className="relative block w-full max-w-md">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search supported projects"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {FILTERS.map((filterItem) => {
              const active = view === filterItem.value;
              return (
                <button
                  key={filterItem.value}
                  type="button"
                  onClick={() => setView(filterItem.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {filterItem.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-4">
            {isLoading || isFetching ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-[260px] animate-pulse rounded-3xl bg-slate-100" />
                ))}
              </div>
            ) : null}

            {!isLoading && !isFetching && !items.length && !isError ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                <FolderKanban className="mx-auto text-slate-400" size={40} />
                <h3 className="mt-4 text-lg font-bold text-slate-900">No supported projects yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try another filter or search term. When a volunteer application is approved, it will appear here.
                </p>
              </div>
            ) : null}

            {!isLoading && !isFetching && items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <ProjectCard key={item.applicationId} item={item} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} result{pagination.total === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SupportedProjectsPage;
