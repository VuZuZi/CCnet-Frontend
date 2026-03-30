import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ExternalLink,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Share2,
  TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';

import { useToast } from '@/shared/contexts/ToastContext';
import { formatDate } from '@/shared/lib/formatters';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

import { HELP_REQUEST_CATEGORIES, URGENCY_LEVELS } from '../../validations/helpRequestSchema';
import { StatusBadge } from './StatusBadge';
import { RoleUpgradeModal } from '../RoleUpgradeModal';

const CATEGORY_LABELS = Object.fromEntries(
  HELP_REQUEST_CATEGORIES.map((item) => [item.value, item.label])
);

const URGENCY_LABELS = Object.fromEntries(
  URGENCY_LEVELS.map((item) => [item.value, item.label])
);

const URGENCY_STYLES = {
  LOW: 'border border-emerald-200 bg-emerald-100 text-emerald-800',
  MEDIUM: 'border border-sky-200 bg-sky-100 text-sky-800',
  HIGH: 'border border-orange-200 bg-orange-100 text-orange-800',
  CRITICAL: 'border border-rose-200 bg-rose-100 text-rose-800',
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

export function HelpRequestDetailHero({ helpRequest }) {
  const toast = useToast();
  const navigate = useNavigate();
  const userRole = useAuthStore(authSelectors.userRole);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const isOrganizer = userRole === 'Organizer' || userRole === 'organizer';
  const {
    _id,
    title,
    category,
    urgencyLevel,
    location,
    contactPhone,
    contactEmail,
    linkedProjectId,
    requesterId,
    status,
    createdAt,
    evidences = [],
  } = helpRequest;

  const requester = getPopulatedEntity(requesterId);
  const linkedProject = getPopulatedEntity(linkedProjectId);
  const coverImage = evidences.find((item) => item?.mediaType === 'image' || !item?.mediaType)?.url;
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
      if (error?.name === 'AbortError') {
        return;
      }

      toast.error('Could not share this request right now.');
    }
  };

  const handleHostProject = () => {
    if (isOrganizer) {
      navigate(`/projects/create?helpRequestId=${_id}`);
      return;
    }

    setShowRoleModal(true);
  };

  const handleAssignNow = () => {
    setShowRoleModal(false);
    navigate('/organizer/apply');
  };

  const handleLater = () => {
    setShowRoleModal(false);
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative h-72 w-full overflow-hidden bg-slate-200 sm:h-80">
        {coverImage ? (
          <img src={coverImage} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-sky-100">
            <div className="rounded-full bg-white/80 p-5 shadow-lg shadow-amber-200/60">
              <HeartHandshake className="h-14 w-14 text-amber-500" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

        <div className="absolute left-5 top-5 flex flex-wrap gap-2 sm:left-6 sm:top-6">
          <span className="rounded-full border border-white/60 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 backdrop-blur">
            {categoryLabel}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${urgencyClass}`}>
            {urgencyLabel} urgency
          </span>
        </div>

        <div className="absolute right-5 top-5 sm:right-6 sm:top-6">
          <StatusBadge status={status} size="sm" className="bg-white/95 backdrop-blur" />
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={16} className="text-sky-500" />
            {location?.address || 'Location will be confirmed by CCNet'}
          </span>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={16} className="text-emerald-500" />
            Submitted {formatDate(createdAt) || 'recently'}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="max-w-4xl text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            This request is published directly to the community so supporters and organizers can
            quickly connect and take action.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Submitted By
            </p>

            <div className="mt-3 flex items-center gap-3">
              {requester?.avatar ? (
                <img
                  src={requester.avatar}
                  alt={requester.fullName || 'Requester'}
                  className="h-12 w-12 rounded-full border border-white object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 shadow-sm">
                  {getInitials(requester?.fullName)}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900">
                  {requester?.fullName || 'Community requester'}
                </p>
                <p className="truncate text-sm text-slate-500">
                  {requester?.email || 'CCNet requester profile'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              <TriangleAlert size={14} />
              Support Options
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                {categoryLabel}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                {urgencyLabel} priority
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <Phone size={16} className="text-amber-500" />
                  {contactPhone}
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <Mail size={16} className="text-amber-500" />
                  {contactEmail}
                </a>
              )}
              {!contactPhone && !contactEmail && (
                <span className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  Contact details will be shared after verification.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          {linkedProject ? (
            <Link
              to={`/projects/${linkedProject._id || linkedProject.id}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-amber-500"
            >
              <ExternalLink size={18} />
              View Linked Project
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleHostProject}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-amber-500"
            >
              <HeartHandshake size={18} />
              Host the Project
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>

        <RoleUpgradeModal
          isOpen={showRoleModal}
          onAssignNow={handleAssignNow}
          onLater={handleLater}
        />
      </div>
    </section>
  );
}
