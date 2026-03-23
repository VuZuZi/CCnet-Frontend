import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const formatCount = (value) => new Intl.NumberFormat('en-US').format(value || 0);

export function HelpRequestHeader({ loadedCount = 0, totalCount = 0 }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
          NeedHelp Requests
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
            Page size: {formatCount(loadedCount)}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 sm:text-sm">
            Total: {formatCount(totalCount)}
          </span>
        </div>
      </div>

      <Link
        to="/need-help/create"
        className="inline-flex h-10 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm shadow-amber-500/20 transition-colors hover:bg-amber-500"
      >
        <Plus size={16} />
        New Request
      </Link>
    </div>
  );
}
