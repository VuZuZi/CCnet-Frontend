import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export function HelpRequestHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
          NeedHelp Requests
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Find requests that match your capacity and support people in urgent need.
        </p>
      </div>

      <Link
        to="/need-help/create"
        className="inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm shadow-amber-500/20 transition-colors hover:bg-amber-500"
      >
        <Plus size={16} />
        Create New Request
        <span className="hidden text-xs font-semibold text-slate-700/90 sm:inline">Share your story</span>
      </Link>
    </div>
  );
}
