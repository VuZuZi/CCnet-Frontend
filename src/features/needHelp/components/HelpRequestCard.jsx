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
      className={`group block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-amber-200 hover:shadow-md sm:p-4 border-l-4 ${urgencyBorder}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-20 w-full flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-28">
          {coverImage ? (
            <img
              src={coverImage}
              alt={helpRequest.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-sky-100 text-sm font-bold text-slate-600">
              {getInitials(requesterName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyle}`}>
              {statusLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {categoryLabel}
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
              {helpRequest.urgencyLevel}
            </span>
          </div>

          <div className="mt-2.5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-base font-bold leading-tight text-slate-900 transition-colors group-hover:text-amber-600 sm:text-lg">
                {helpRequest.title}
              </h3>
              <p className="mt-1.5 line-clamp-1 text-sm leading-5 text-slate-600">
                {helpRequest.story}
              </p>
            </div>

            <div className="hidden flex-shrink-0 items-center gap-2 text-sm font-semibold text-slate-400 group-hover:text-amber-600 lg:flex">
              View
              <ChevronRight size={16} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <UserRound size={14} className="text-slate-400" />
              {requesterName}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} className="text-slate-400" />
              {locationAddress}
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-slate-700">
              <CircleDollarSign size={14} className="text-amber-500" />
              {helpRequest.amountNeeded ? formatCurrency(helpRequest.amountNeeded) : 'Flexible support'}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-400" />
              {formatDate(helpRequest.createdAt) || 'Recently submitted'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
