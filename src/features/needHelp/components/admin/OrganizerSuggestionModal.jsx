import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import { useOrganizerSuggestions } from '../../hooks/useHelpRequestQueries';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('') || 'O';

const formatJoinDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return null;
  }
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 flex items-start gap-2 text-sm text-slate-700">
        <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" />
        <span className="break-words">{value}</span>
      </p>
    </div>
  );
}

function OrganizerPreviewCard({ organizer }) {
  if (!organizer) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <UserRound size={28} className="text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Hover over an organizer</p>
        <p className="mt-1 text-xs leading-6 text-slate-400">
          Preview profile details and match quality before assigning.
        </p>
      </div>
    );
  }

  const skills = organizer.skills || [];
  const joinDate = formatJoinDate(organizer.createdAt);

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          {organizer.avatar ? (
            <img
              src={organizer.avatar}
              alt={organizer.fullName}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base font-bold text-amber-700">
              {getInitials(organizer.fullName)}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-900">
              {organizer.fullName}
            </p>
            {organizer.title ? (
              <p className="truncate text-xs font-medium text-amber-700">
                {organizer.title} · Lv.{organizer.level || 1}
              </p>
            ) : null}
            <p className="truncate text-xs text-slate-500">{organizer.email}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
            <p className="text-lg font-black text-slate-900">
              {organizer.followersCount ?? 0}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Followers
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
            <p className="text-lg font-black text-slate-900">
              {organizer.followingCount ?? 0}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Following
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
            <p className="text-lg font-black text-slate-900">
              {organizer.level ?? 1}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Level
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {organizer.headline ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Headline
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {organizer.headline}
              </p>
            </div>
          ) : null}

          <InfoRow
            icon={MapPin}
            label="Location"
            value={organizer.location || 'Not specified'}
          />
          <InfoRow icon={Phone} label="Phone" value={organizer.phone} />
          <InfoRow icon={Mail} label="Email" value={organizer.email} />
          <InfoRow icon={CalendarDays} label="Joined" value={joinDate} />

          {organizer.about ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                About
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {organizer.about}
              </p>
            </div>
          ) : null}

          {skills.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.slice(0, 8).map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700"
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 8 ? (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
                    +{skills.length - 8}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {organizer.match ? (
        <div className="mt-4 rounded-[22px] border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
            <Sparkles size={13} />
            Match Analysis
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white px-3 py-3 text-center">
              <p className="text-lg font-black text-amber-700">
                {organizer.match.score ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                Total
              </p>
            </div>

            <div className="rounded-2xl bg-white px-3 py-3 text-center">
              <p className="text-lg font-black text-slate-900">
                {organizer.match.relevanceScore ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                Relevance
              </p>
            </div>

            <div className="rounded-2xl bg-white px-3 py-3 text-center">
              <p className="text-lg font-black text-slate-900">
                {Number.isFinite(organizer.match?.distanceKm)
                  ? organizer.match.distanceKm.toFixed(0)
                  : '—'}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                km
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OrganizerRow({ organizer, hoveredOrganizer, setHoveredOrganizer, onAssign, isAssigning }) {
  const isHovered = hoveredOrganizer?._id === organizer._id;
  const subtitle = organizer.location || organizer.email || 'Organizer profile';
  const score = organizer.match?.score ?? 0;

  return (
    <div
      onMouseEnter={() => setHoveredOrganizer(organizer)}
      className={`flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3 transition-all duration-150 ${
        isHovered
          ? 'border-amber-300 bg-amber-50/80 shadow-sm'
          : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {organizer.avatar ? (
          <img
            src={organizer.avatar}
            alt={organizer.fullName}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {getInitials(organizer.fullName)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {organizer.fullName}
          </p>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="truncate">{subtitle}</span>

            {score > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                <Star size={11} className="fill-amber-500" />
                {score}
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1 text-slate-400">
              <Users size={11} />
              {organizer.followersCount ?? 0}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAssign(organizer)}
        disabled={isAssigning}
        className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Assign
      </button>
    </div>
  );
}

export function OrganizerSuggestionModal({
  isOpen,
  helpRequest,
  onClose,
  onAssign,
  isAssigning,
}) {
  const [search, setSearch] = useState('');
  const [hoveredOrganizer, setHoveredOrganizer] = useState(null);

  const queryFilters = useMemo(() => ({ search, limit: 30 }), [search]);
  const { data, isLoading } = useOrganizerSuggestions(
    helpRequest?._id,
    queryFilters,
    isOpen
  );

  if (!isOpen) return null;

  const organizers = data?.items || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-[2px]">
      <div
        className="flex w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
        style={{ maxHeight: '88vh' }}
      >
        <div className="hidden w-[340px] shrink-0 border-r border-slate-100 bg-slate-50/60 p-5 lg:flex lg:flex-col">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
              <Sparkles size={13} />
              Organizer Preview
            </div>
          </div>

          <OrganizerPreviewCard organizer={hoveredOrganizer} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Assign Organizer
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Browse suggestions, preview profile details, and assign the best match.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <label className="relative block">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search organizer by name, email, or location..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-14 text-slate-500">
                <Loader2 size={18} className="mr-2 animate-spin" />
                Loading organizers...
              </div>
            ) : null}

            {!isLoading && !organizers.length ? (
              <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                No organizer found for this filter.
              </div>
            ) : null}

            {!isLoading && organizers.length ? (
              <div className="space-y-3">
                {organizers.map((organizer) => (
                  <OrganizerRow
                    key={organizer._id}
                    organizer={organizer}
                    hoveredOrganizer={hoveredOrganizer}
                    setHoveredOrganizer={setHoveredOrganizer}
                    onAssign={onAssign}
                    isAssigning={isAssigning}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerSuggestionModal;