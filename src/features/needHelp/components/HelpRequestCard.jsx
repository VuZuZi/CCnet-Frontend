import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, CircleDollarSign, MapPin, UserRound } from 'lucide-react';

import { formatCurrency, formatDate } from '@/shared/lib/formatters';



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
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_-6px_rgba(15,23,42,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_32px_-20px_rgba(15,23,42,0.45),0_10px_20px_-18px_rgba(245,158,11,0.45)]"
    >
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">

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
