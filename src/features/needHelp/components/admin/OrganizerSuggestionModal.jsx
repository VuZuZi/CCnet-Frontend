import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Loader2,
  MapPin,
  Phone,
  Mail,
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
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return null;
  }
};

function InfoRow({ icon: Icon, label, value, className = '' }) {
  if (!value) return null;
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-700">
        <Icon size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
        <span className="break-words">{value}</span>
      </p>
    </div>
  );
}

function OrganizerPreviewCard({ organizer }) {
  if (!organizer) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <UserRound size={28} className="text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-400">Hover over an organizer</p>
        <p className="mt-1 text-xs text-slate-400">to preview their profile</p>
      </div>
    );
  }

  const skills = organizer.skills || [];
  const joinDate = formatJoinDate(organizer.createdAt);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        {organizer.avatar ? (
          <img
            src={organizer.avatar}
            alt={organizer.fullName}
            className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-base font-bold text-amber-700 shadow-sm">
            {getInitials(organizer.fullName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{organizer.fullName}</p>
          {organizer.title && (
            <p className="truncate text-xs font-medium text-amber-600">{organizer.title} · Lv.{organizer.level || 1}</p>
          )}
          <p className="truncate text-xs text-slate-500">{organizer.email}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-1.5 border-t border-b border-slate-100 py-3">
        <div className="text-center">
          <p className="text-base font-bold text-slate-900">{organizer.followersCount ?? 0}</p>
          <p className="text-[10px] text-slate-400">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-slate-900">{organizer.followingCount ?? 0}</p>
          <p className="text-[10px] text-slate-400">Following</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-slate-900">{organizer.level ?? 1}</p>
          <p className="text-[10px] text-slate-400">Level</p>
        </div>
      </div>

      {/* Detail Info */}
      <div className="mt-3 space-y-3">
        {organizer.headline && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Headline</p>
            <p className="mt-1 text-sm leading-snug text-slate-700">{organizer.headline}</p>
          </div>
        )}

        <InfoRow icon={MapPin} label="Location" value={organizer.location || 'Not specified'} />
        <InfoRow icon={Phone} label="Phone" value={organizer.phone} />
        <InfoRow icon={Mail} label="Email" value={organizer.email} />

        {joinDate && (
          <InfoRow icon={CalendarDays} label="Joined" value={joinDate} />
        )}

        {organizer.about && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">About</p>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600">{organizer.about}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Skills</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {skills.slice(0, 6).map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 6 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                  +{skills.length - 6}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Match Score */}
      {organizer.match && (
        <div className="mt-auto pt-3">
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600">
              <Sparkles size={12} />
              Match Analysis
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-black text-amber-600">{organizer.match.score ?? 0}</p>
                <p className="text-[10px] text-slate-500">Total</p>
              </div>
              <div>
                <p className="text-lg font-black text-slate-700">{organizer.match.relevanceScore ?? 0}</p>
                <p className="text-[10px] text-slate-500">Relevance</p>
              </div>
              <div>
                <p className="text-lg font-black text-slate-700">
                  {Number.isFinite(organizer.match?.distanceKm) ? `${organizer.match.distanceKm.toFixed(0)}` : '—'}
                </p>
                <p className="text-[10px] text-slate-500">km</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
  const { data, isLoading } = useOrganizerSuggestions(helpRequest?._id, queryFilters, isOpen);

  if (!isOpen) return null;

  const organizers = data?.items || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ maxHeight: '85vh' }}>

        {/* Left: Preview Panel */}
        <div className="hidden w-[280px] flex-shrink-0 border-r border-slate-100 bg-slate-50/50 p-4 lg:flex lg:flex-col" style={{ minHeight: '480px' }}>
          <OrganizerPreviewCard organizer={hoveredOrganizer} />
        </div>

        {/* Right: Search + List */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Assign Organizer</h3>
              <p className="text-sm text-slate-500">Hover to preview · Click Assign to confirm.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 pt-4">
            <label className="relative block">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search organizer by name, email, location"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-amber-400"
              />
            </label>
          </div>

          <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto px-5 pb-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-500">
                <Loader2 size={18} className="mr-2 animate-spin" />
                Loading organizers...
              </div>
            ) : null}

            {!isLoading && !organizers.length ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No organizer found for this filter.
              </div>
            ) : null}

            {!isLoading
              ? organizers.map((organizer) => {
                  const isHovered = hoveredOrganizer?._id === organizer._id;
                  return (
                    <div
                      key={organizer._id}
                      onMouseEnter={() => setHoveredOrganizer(organizer)}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-150 ${
                        isHovered
                          ? 'border-amber-300 bg-amber-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-amber-200 hover:bg-amber-50/30'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {organizer.avatar ? (
                          <img
                            src={organizer.avatar}
                            alt={organizer.fullName}
                            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {getInitials(organizer.fullName)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{organizer.fullName}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="truncate">{organizer.location || organizer.email}</span>
                            {organizer.match?.score > 0 && (
                              <>
                                <span className="text-slate-300">·</span>
                                <span className="inline-flex flex-shrink-0 items-center gap-0.5 font-semibold text-amber-600">
                                  <Star size={10} className="fill-amber-500" />
                                  {organizer.match.score}
                                </span>
                              </>
                            )}
                            <span className="hidden text-slate-300 sm:inline">·</span>
                            <span className="hidden flex-shrink-0 items-center gap-0.5 text-slate-400 sm:inline-flex">
                              <Users size={10} />
                              {organizer.followersCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAssign(organizer)}
                        disabled={isAssigning}
                        className="ml-3 flex-shrink-0 rounded-lg bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-900 transition-colors hover:bg-amber-500 disabled:opacity-60"
                      >
                        Assign
                      </button>
                    </div>
                  );
                })
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerSuggestionModal;
