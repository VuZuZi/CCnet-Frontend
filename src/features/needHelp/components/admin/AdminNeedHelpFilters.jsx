import { Search, SlidersHorizontal, ShieldAlert, RotateCcw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const URGENCY_OPTIONS = [
  { value: '', label: 'All urgency' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export function AdminNeedHelpFilters({ filters, onChange }) {
  const handleChange = (field) => (event) => {
    onChange({
      ...filters,
      [field]: event.target.value,
      page: 1,
    });
  };

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.urgencyLevel);

  const handleReset = () => {
    onChange({
      ...filters,
      search: '',
      status: '',
      urgencyLevel: '',
      page: 1,
    });
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_55px_-36px_rgba(15,23,42,0.18)]">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
              <SlidersHorizontal size={14} />
              Control Panel
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Search and narrow down requests before opening assignment flow.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white px-6 py-5 sm:px-8">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.75fr)_minmax(220px,0.75fr)_auto]">
          <label className="relative block">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={filters.search}
              onChange={handleChange('search')}
              placeholder="Search by title, story, requester or location..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />
          </label>

          <div className="relative">
            <ShieldAlert
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={filters.status}
              onChange={handleChange('status')}
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pl-11 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ShieldAlert
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={filters.urgencyLevel}
              onChange={handleChange('urgencyLevel')}
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pl-11 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
            >
              {URGENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 text-sm font-bold text-slate-950 shadow-[0_12px_24px_-12px_rgba(245,158,11,0.55)] transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdminNeedHelpFilters;