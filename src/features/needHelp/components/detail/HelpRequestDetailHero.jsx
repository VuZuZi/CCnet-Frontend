import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Share2,
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
  LOW: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  MEDIUM: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  HIGH: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  CRITICAL: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
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

function MetaItem({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3.5 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
      <Icon size={15} className="text-slate-400" />
      <span className="break-words">{children}</span>
    </div>
  );
}

function ContactPill({ icon: Icon, href, children }) {
  return (
    <a
      href={href}
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Icon size={15} className="shrink-0 text-amber-500" />
      <span className="break-all">{children}</span>
    </a>
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

  const categoryLabel = CATEGORY_LABELS[category] || 'Hỗ trợ cộng đồng';
  const urgencyLabel = URGENCY_LABELS[urgencyLevel] || 'Trung bình';
  const urgencyClass = URGENCY_STYLES[urgencyLevel] || URGENCY_STYLES.MEDIUM;

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title,
      text: `Hỗ trợ yêu cầu cần giúp đỡ này trên CCNet: ${title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Đã mở bảng chia sẻ.');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Đã sao chép liên kết vào clipboard.');
        return;
      }

      throw new Error('Chia sẻ không được hỗ trợ');
    } catch (error) {
      if (error?.name === 'AbortError') return;
      toast.error('Hiện không thể chia sẻ yêu cầu này.');
    }
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="border-b border-slate-100 bg-slate-50 xl:border-b-0 xl:border-r">
          <div className="flex h-full flex-col">
            <div className="flex flex-wrap gap-2 px-6 pt-6">
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 ring-1 ring-slate-200">
                {categoryLabel}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${urgencyClass}`}
              >
                {urgencyLabel}
              </span>
            </div>

            <div className="flex flex-1 items-center justify-center p-6">
              {coverImage ? (
                <div className="flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-[24px] bg-white ring-1 ring-slate-200">
                  <img
                    src={coverImage}
                    alt={title}
                    className="max-h-[420px] w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex min-h-[360px] w-full items-center justify-center rounded-[24px] bg-gradient-to-br from-amber-100 via-orange-50 to-sky-100 ring-1 ring-slate-200">
                  <div className="rounded-full bg-white p-5 shadow-sm">
                    <ExternalLink className="h-10 w-10 text-amber-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-3">
                <MetaItem icon={MapPin}>
                  {location?.address || 'Địa điểm sẽ được CCNet xác nhận'}
                </MetaItem>

                <MetaItem icon={CalendarDays}>
                  Ngày gửi {formatDate(createdAt) || 'gần đây'}
                </MetaItem>
              </div>

              <div className="mt-6">
                <h1 className="max-w-4xl text-3xl font-black leading-[1.15] tracking-tight text-slate-950 sm:text-[40px]">
                  {title}
                </h1>

                <p className="mt-4 max-w-3xl text-[15px] leading-8 text-slate-500">
                  Yêu cầu này hiển thị cho cộng đồng để nhà tổ chức và người hỗ trợ có thể
                  xem xét, xác minh thông tin và phản hồi một cách có trách nhiệm.
                </p>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Người gửi
                  </p>

                  <div className="mt-4 flex items-center gap-4">
                    {requester?.avatar ? (
                      <img
                        src={requester.avatar}
                        alt={requester.fullName || 'Người gửi yêu cầu'}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-base font-bold text-amber-700">
                        {getInitials(requester?.fullName)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900">
                        {requester?.fullName || 'Người gửi từ cộng đồng'}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {requester?.email || 'Hồ sơ người gửi CCNet'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Tùy chọn hỗ trợ
                  </p>

                  <div className="mt-4 flex flex-col gap-3">
                    {contactPhone ? (
                      <ContactPill icon={Phone} href={`tel:${contactPhone}`}>
                        {contactPhone}
                      </ContactPill>
                    ) : null}

                    {contactEmail ? (
                      <ContactPill icon={Mail} href={`mailto:${contactEmail}`}>
                        {contactEmail}
                      </ContactPill>
                    ) : null}

                    {!contactPhone && !contactEmail ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        Thông tin liên hệ sẽ được chia sẻ sau khi kiểm duyệt.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              {linkedProject ? (
                <Link
                  to={`/projects/${linkedProject._id || linkedProject.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  <ExternalLink size={16} />
                  Xem dự án liên kết
                </Link>
              ) : null}

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Share2 size={16} />
                Chia sẻ yêu cầu
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HelpRequestDetailHero;
