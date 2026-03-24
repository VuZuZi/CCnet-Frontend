import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, CircleDollarSign, MapPin, UserRound } from 'lucide-react';

import { formatCurrency, formatDate } from '@/shared/lib/formatters';

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-800',
  VERIFIED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-slate-100 text-slate-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const STATUS_LABELS = {
  PENDING: 'Submitted',
  VERIFIED: 'Published',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const URGENCY_BORDER = {
  CRITICAL: 'border-l-rose-500',
  HIGH: 'border-l-orange-500',
  MEDIUM: 'border-l-amber-400',
  LOW: 'border-l-emerald-500',
};

const CATEGORY_LABELS = {
  Y_TE: 'Medical Aid',
  GIAO_DUC: 'Education',
  THIEN_TAI: 'Disaster Relief',
  XAY_DUNG: 'Construction',
  MOI_TRUONG: 'Environment',
  KHAC: 'Other',
};

export function HelpRequestCard({ helpRequest }) {
  const coverImage = helpRequest.evidences?.[0]?.url;
  const statusStyle = STATUS_STYLES[helpRequest.status] || STATUS_STYLES.PENDING;
  const statusLabel = STATUS_LABELS[helpRequest.status] || 'Unknown';
  const urgencyBorder = URGENCY_BORDER[helpRequest.urgencyLevel] || '';
  const categoryLabel = CATEGORY_LABELS[helpRequest.category] || 'Other';

  const requesterName = helpRequest.requesterId?.fullName || 'Anonymous';
  const locationAddress = helpRequest.location?.address || 'Location not specified';

  const getInitials = (name) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'A';
  };

  return (
    <Link
      to={`/need-help/${helpRequest._id}`}
      className={`group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md border-l-4 ${urgencyBorder}`}
    >
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyle}`}>
            {statusLabel}
          </span>
        </div>

        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
            {categoryLabel}
          </span>
          <span className="rounded-full bg-amber-50/95 px-2.5 py-1 text-[11px] font-semibold text-amber-700 shadow-sm">
            {helpRequest.urgencyLevel}
          </span>
        </div>

        <div className="h-full w-full">
          {coverImage ? (
            <img
              src={coverImage}
              alt={helpRequest.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-sky-100 text-sm font-bold text-slate-600">
              {getInitials(requesterName)}
            </div>
          )}
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-amber-600">
              {helpRequest.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600">
              {helpRequest.story}
            </p>
          </div>

          <div className="hidden flex-shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-400 transition-colors group-hover:text-amber-600 2xl:flex">
            View
            <ChevronRight size={16} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:text-sm">
          <span className="inline-flex items-center gap-2 truncate">
            <UserRound size={14} className="text-slate-400" />
            <span className="truncate">{requesterName}</span>
          </span>
          <span className="inline-flex items-center gap-2 truncate">
            <MapPin size={14} className="text-slate-400" />
            <span className="truncate">{locationAddress}</span>
          </span>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 truncate font-semibold text-slate-700">
              <CircleDollarSign size={14} className="text-amber-500" />
              <span className="truncate">{helpRequest.amountNeeded ? formatCurrency(helpRequest.amountNeeded) : 'Flexible support'}</span>
            </span>
            <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-xs">
              <CalendarDays size={13} className="text-slate-400" />
              {formatDate(helpRequest.createdAt) || 'Recently'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
