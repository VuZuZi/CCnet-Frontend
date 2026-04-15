import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Share2,
  TriangleAlert,
} from 'lucide-react';

import { useToast } from '@/shared/contexts/ToastContext';
import { formatDate } from '@/shared/lib/formatters';

import { HELP_REQUEST_CATEGORIES, URGENCY_LEVELS } from '../../validations/helpRequestSchema';

const CATEGORY_LABELS = Object.fromEntries(
  HELP_REQUEST_CATEGORIES.map((item) => [item.value, item.label])
);

const URGENCY_LABELS = Object.fromEntries(
  URGENCY_LEVELS.map((item) => [item.value, item.label])
);

const URGENCY_STYLES = {
  LOW: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  MEDIUM: 'border border-sky-200 bg-sky-50 text-sky-700',
  HIGH: 'border border-orange-200 bg-orange-50 text-orange-700',
  CRITICAL: 'border border-rose-200 bg-rose-50 text-rose-700',
};

const getPopulatedEntity = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null;

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'CC';

function CompactMeta({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
      <Icon size={15} className="text-slate-400" />
      {children}
    </span>
  );
}

export function HelpRequestDetailHero({ helpRequest }) {
  const toast = useToast();

  const {
    title,
    category,
    urgencyLevel,
    location,
    contactPhone,
    contactEmail,
    linkedProjectId,
    requesterId,
    createdAt,
    evidences = [],
  } = helpRequest;

  const requester = getPopulatedEntity(requesterId);
  const linkedProject = getPopulatedEntity(linkedProjectId);
  const coverImage = evidences.find(
    (item) => item?.mediaType === 'image' || !item?.mediaType
  )?.url;

  const categoryLabel = CATEGORY_LABELS[category] || 'Community Support';
  const urgencyLabel = URGENCY_LABELS[urgencyLevel] || 'Medium';
  const urgencyClass = URGENCY_STYLES[urgencyLevel] || URGENCY_STYLES.MEDIUM;

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title,
      text: `Support this NeedHelp request on CCNet: ${title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Share sheet opened.');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard.');
        return;
      }

      throw new Error('Share is not supported');
    } catch (error) {
      if (error?.name === 'AbortError') return;
      toast.error('Could not share this request right now.');
    }
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="relative h-60 overflow-hidden bg-slate-100 lg:h-full">
          {coverImage ? (
            <img src={coverImage} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-sky-100">
              <div className="rounded-full bg-white/80 p-4 shadow-lg shadow-amber-200/50">
                <ExternalLink className="h-10 w-10 text-amber-500" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
              {categoryLabel}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${urgencyClass}`}
            >
              {urgencyLabel}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <CompactMeta icon={MapPin}>
                <span className="break-words">
                  {location?.address || 'Location will be confirmed by CCNet'}
                </span>
              </CompactMeta>

              <CompactMeta icon={CalendarDays}>
                Submitted {formatDate(createdAt) || 'recently'}
              </CompactMeta>
            </div>

            <div>
              <h1 className="max-w-4xl break-words text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-[34px]">
                {title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                This request is visible to the community so organizers and supporters can review it
                and take action quickly.
              </p>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Submitted By
                </p>

                <div className="mt-3 flex items-center gap-3">
                  {requester?.avatar ? (
                    <img
                      src={requester.avatar}
                      alt={requester.fullName || 'Requester'}
                      className="h-11 w-11 rounded-full border border-white object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 shadow-sm">
                      {getInitials(requester?.fullName)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {requester?.fullName || 'Community requester'}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {requester?.email || 'CCNet requester profile'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] border border-amber-200 bg-amber-50/70 px-4 py-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                  <TriangleAlert size={13} />
                  Support Options
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {contactPhone && (
                    <a
                      href={`tel:${contactPhone}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
                    >
                      <Phone size={15} className="text-amber-500" />
                      {contactPhone}
                    </a>
                  )}

                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/80 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
                    >
                      <Mail size={15} className="shrink-0 text-amber-500" />
                      <span className="break-all">{contactEmail}</span>
                    </a>
                  )}

                  {!contactPhone && !contactEmail && (
                    <span className="rounded-full border border-white/80 bg-white px-3.5 py-2 text-sm text-slate-500">
                      Contact details will be shared after review.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
              {linkedProject ? (
                <Link
                  to={`/projects/${linkedProject._id || linkedProject.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  <ExternalLink size={16} />
                  View Linked Project
                </Link>
              ) : null}

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HelpRequestDetailHero;