import { Link } from 'react-router-dom';
import { CalendarDays, CircleDollarSign, MapPin } from 'lucide-react';

import { formatDate, formatVND } from '@/shared/lib/formatters';
import { StatusBadge } from './detail/StatusBadge';
import { HELP_REQUEST_CATEGORIES, URGENCY_LEVELS } from '../validations/helpRequestSchema';

const CATEGORY_LABELS = Object.fromEntries(
  HELP_REQUEST_CATEGORIES.map((item) => [item.value, item.label])
);

const URGENCY_MAP = Object.fromEntries(
  URGENCY_LEVELS.map((item) => [item.value, item])
);

function getCoverImage(evidences = []) {
  return evidences.find((item) => item?.mediaType === 'image' || !item?.mediaType)?.url || null;
}

function formatCompactAmount(amountNeeded = 0) {
  const amount = Number(amountNeeded || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Flexible Support';
  }

  if (amount >= 1_000_000_000_000) {
    return `${(amount / 1_000_000_000_000).toLocaleString('vi-VN', {
      maximumFractionDigits: 1,
    })} nghìn tỷ đ`;
  }

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toLocaleString('vi-VN', {
      maximumFractionDigits: 1,
    })} tỷ đ`;
  }

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString('vi-VN', {
      maximumFractionDigits: 1,
    })} triệu đ`;
  }

  return formatVND(amount);
}

function getRequesterName(requesterId) {
  if (!requesterId) return 'Community requester';
  if (typeof requesterId === 'object') {
    return requesterId.fullName || requesterId.username || 'Community requester';
  }
  return 'Community requester';
}

function HelpRequestCard({ helpRequest }) {
  const {
    _id,
    title,
    story,
    category,
    urgencyLevel,
    location,
    amountNeeded,
    createdAt,
    status,
    evidences = [],
    requesterId,
  } = helpRequest || {};

  const coverImage = getCoverImage(evidences);
  const requesterName = getRequesterName(requesterId);
  const categoryLabel = CATEGORY_LABELS[category] || 'Other';
  const urgency = URGENCY_MAP[urgencyLevel];
  const compactAmount = formatCompactAmount(amountNeeded);

  return (
    <Link
      to={`/need-help/${_id}`}
      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_18px_36px_-24px_rgba(15,23,42,0.22)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title || 'Help request'}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 via-slate-100 to-sky-50 px-6 text-center text-sm font-semibold text-slate-400">
            No cover image
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
              urgency?.color || 'bg-slate-100 text-slate-700'
            }`}
          >
            {urgency?.label || urgencyLevel || 'Medium'}
          </span>

          <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700 backdrop-blur">
            {categoryLabel}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent p-3">
          <StatusBadge status={status} size="sm" className="bg-white/95" />
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h3 className="line-clamp-2 text-lg font-extrabold leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-amber-700">
            {title || 'Untitled request'}
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
            {story || 'No story provided for this request.'}
          </p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={15} className="text-slate-400" />
            <span className="line-clamp-1">
              {location?.address || 'Location not specified'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CircleDollarSign size={15} className="text-slate-400" />
            <span className="line-clamp-1">{compactAmount}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays size={15} className="text-slate-400" />
            <span>{formatDate(createdAt) || 'Recently'}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <p className="text-sm font-medium text-slate-700">
            Requested by <span className="font-bold text-slate-900">{requesterName}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default HelpRequestCard;