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
    return new Intl.DateTimeFormat('vi-VN', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return null;
  }
};

const getReadableText = (value, fallback = '') => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const text = value
      .map((item) => getReadableText(item, ''))
      .filter(Boolean)
      .join(', ');

    return text || fallback;
  }

  if (typeof value === 'object') {
    const directText =
      value.address ||
      value.fullAddress ||
      value.name ||
      value.label ||
      value.description ||
      value.email ||
      value.phone;

    if (directText) {
      return getReadableText(directText, fallback);
    }

    const locationParts = [
      value.ward,
      value.district,
      value.city,
      value.province,
      value.country,
    ]
      .map((item) => getReadableText(item, ''))
      .filter(Boolean);

    if (locationParts.length) {
      return locationParts.join(', ');
    }

    return fallback;
  }

  return fallback;
};

const getLocationText = (location, fallback = 'Chưa xác định') =>
  getReadableText(location, fallback);

function InfoRow({ icon: Icon, label, value }) {
  const displayValue = getReadableText(value, '');

  if (!displayValue) return null;

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 flex items-start gap-2 text-sm text-slate-700">
        <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" />
        <span className="break-words">{displayValue}</span>
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
        <p className="text-sm font-semibold text-slate-500">
          Di chuột lên một nhà tổ chức
        </p>
        <p className="mt-1 text-xs leading-6 text-slate-400">
          Xem trước chi tiết hồ sơ và độ phù hợp trước khi giao.
        </p>
      </div>
    );
  }

  const skills = Array.isArray(organizer.skills)
    ? organizer.skills.map((skill) => getReadableText(skill, '')).filter(Boolean)
    : [];

  const joinDate = formatJoinDate(organizer.createdAt);
  const locationText = getLocationText(organizer.location);

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
              Người theo dõi
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
            <p className="text-lg font-black text-slate-900">
              {organizer.followingCount ?? 0}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Đang theo dõi
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
            <p className="text-lg font-black text-slate-900">
              {organizer.level ?? 1}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Cấp độ
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {organizer.headline ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Tiêu đề
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {organizer.headline}
              </p>
            </div>
          ) : null}

          <InfoRow icon={MapPin} label="Địa điểm" value={locationText} />
          <InfoRow icon={Phone} label="Điện thoại" value={organizer.phone} />
          <InfoRow icon={Mail} label="Email" value={organizer.email} />
          <InfoRow icon={CalendarDays} label="Tham gia" value={joinDate} />

          {organizer.about ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Giới thiệu
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {organizer.about}
              </p>
            </div>
          ) : null}

          {skills.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Kỹ năng
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
            Phân tích phù hợp
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white px-3 py-3 text-center">
              <p className="text-lg font-black text-amber-700">
                {organizer.match.score ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                Tổng
              </p>
            </div>

            <div className="rounded-2xl bg-white px-3 py-3 text-center">
              <p className="text-lg font-black text-slate-900">
                {organizer.match.relevanceScore ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                Mức liên quan
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

function OrganizerRow({
  organizer,
  hoveredOrganizer,
  setHoveredOrganizer,
  onAssign,
  isAssigning,
}) {
  const isHovered = hoveredOrganizer?._id === organizer._id;
  const locationText = getLocationText(organizer.location, '');
  const subtitle = locationText || organizer.email || 'Hồ sơ nhà tổ chức';
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
        Giao
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
  const { data, isLoading, isError, error } = useOrganizerSuggestions(
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
              Xem trước nhà tổ chức
            </div>
          </div>

          <OrganizerPreviewCard organizer={hoveredOrganizer} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Giao nhà tổ chức
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Duyệt gợi ý, xem trước hồ sơ và giao cho người phù hợp nhất.
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
                placeholder="Tìm nhà tổ chức theo tên, email hoặc địa điểm..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-14 text-slate-500">
                <Loader2 size={18} className="mr-2 animate-spin" />
                Đang tải danh sách nhà tổ chức...
              </div>
            ) : null}

            {!isLoading && isError ? (
              <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-600">
                {error?.response?.data?.message ||
                  error?.message ||
                  'Không thể tải danh sách nhà tổ chức.'}
              </div>
            ) : null}

            {!isLoading && !isError && !organizers.length ? (
              <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                Không tìm thấy nhà tổ chức phù hợp với bộ lọc này.
              </div>
            ) : null}

            {!isLoading && !isError && organizers.length ? (
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