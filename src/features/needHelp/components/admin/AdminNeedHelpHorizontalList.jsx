import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  UserRound,
  Image as ImageIcon,
} from 'lucide-react';

import { formatDate, formatVND } from '@/shared/lib/formatters';

const URGENCY_STYLES = {
  CRITICAL: 'border border-rose-200 bg-rose-50 text-rose-700',
  HIGH: 'border border-orange-200 bg-orange-50 text-orange-700',
  MEDIUM: 'border border-amber-200 bg-amber-50 text-amber-700',
  LOW: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
};

const CATEGORY_LABELS = {
  Y_TE: 'Hỗ trợ y tế',
  GIAO_DUC: 'Giáo dục',
  THIEN_TAI: 'Cứu trợ thiên tai',
  XAY_DUNG: 'Xây dựng',
  MOI_TRUONG: 'Môi trường',
  KHAC: 'Khác',
};

function getInitials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'NH'
  );
}

function formatCompactVND(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Hỗ trợ linh hoạt';
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

function MetaItem({ icon: Icon, label, value, strong = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        <Icon size={12} />
        {label}
      </p>
      <p
        className={`mt-1.5 break-words text-sm ${
          strong ? 'font-semibold text-slate-900' : 'text-slate-700'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function RequestCard({ item }) {
  const detailPath = `/admin/need-help/${item._id}`;
  const urgencyStyle = URGENCY_STYLES[item.urgencyLevel] || URGENCY_STYLES.MEDIUM;
  const categoryLabel = CATEGORY_LABELS[item.category] || 'Khác';
  const requesterName = item.requesterId?.fullName || 'Ẩn danh';
  const coverImage = item.evidences?.[0]?.url;

  return (
    <article className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_22px_-22px_rgba(15,23,42,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_16px_30px_-24px_rgba(15,23,42,0.3)]">
      <div className="grid gap-0 xl:grid-cols-[180px_minmax(0,1fr)]">
        <div className="relative h-44 overflow-hidden bg-slate-100 xl:h-full">
          {coverImage ? (
            <img
              src={coverImage}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 text-3xl font-black text-slate-500">
              {getInitials(requesterName)}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-slate-950/5 to-transparent" />

          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${urgencyStyle}`}
            >
              {item.urgencyLevel}
            </span>
            <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700 backdrop-blur">
              {categoryLabel}
            </span>
          </div>

        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h3 className="line-clamp-2 break-all text-xl font-extrabold leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-amber-700">
                  {item.title || 'Yêu cầu chưa có tiêu đề'}
                </h3>

                <p className="mt-2 line-clamp-2 break-all text-sm leading-7 text-slate-500">
                  {item.story || 'Yêu cầu này chưa có câu chuyện mô tả.'}
                </p>
              </div>

              <Link
                to={detailPath}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                Xem chi tiết
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              <MetaItem icon={UserRound} label="Người gửi" value={requesterName} strong />
              <MetaItem
                icon={MapPin}
                label="Địa điểm"
                value={item.location?.address || 'Chưa có địa điểm cụ thể'}
              />
              <MetaItem
                icon={CircleDollarSign}
                label="Kinh phí"
                value={formatCompactVND(item.amountNeeded)}
                strong
              />
              <MetaItem
                icon={CalendarDays}
                label="Ngày gửi"
                value={formatDate(item.createdAt) || 'Gần đây'}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AdminNeedHelpHorizontalList({ items = [] }) {
  if (!items.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <ImageIcon size={24} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Không tìm thấy yêu cầu phù hợp</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Hãy điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để hiển thị thêm yêu cầu trợ giúp.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <RequestCard key={item._id} item={item} />
      ))}
    </div>
  );
}

export default AdminNeedHelpHorizontalList;