import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CircleDollarSign, MapPin } from 'lucide-react';
import {
  getCategoryLabel,
  getUrgencyBadgeClass,
  getUrgencyLabel,
} from '../../utils/helpRequestMap.utils';

function NeedHelpMapCardComponent({
  item,
  isActive = false,
  onClick,
}) {
  if (!item) return null;

  return (
    <div className="px-3 py-2">
      <button
        type="button"
        onClick={() => onClick?.(item)}
        className={`w-full rounded-[28px] border p-4 text-left transition-all ${
          isActive
            ? 'border-amber-300 bg-amber-50 shadow-[0_16px_36px_rgba(251,191,36,0.18)] ring-2 ring-amber-200/70'
            : 'border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${getUrgencyBadgeClass(
              item.urgencyLevel
            )}`}
          >
            {getUrgencyLabel(item.urgencyLevel)}
          </span>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
            {getCategoryLabel(item.category)}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-slate-900">
          {item.title}
        </h3>

        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{item.address}</span>
        </div>

        <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">
          {item.story || 'Yêu cầu trợ giúp này đang chờ được xem xét và hỗ trợ.'}
        </p>

        {Number(item.amountNeeded || 0) > 0 ? (
          <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <CircleDollarSign size={13} />
              Mức hỗ trợ cần thiết
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {Number(item.amountNeeded || 0).toLocaleString('vi-VN')} đ
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-500">
            Bấm để định vị trên bản đồ
          </span>

          <Link
            to={`/need-help/${item.id}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FBBF24] px-3.5 py-2 text-xs font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-amber-500"
          >
            Chi tiết
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </button>
    </div>
  );
}

const NeedHelpMapCard = memo(
  NeedHelpMapCardComponent,
  (prevProps, nextProps) =>
    prevProps.item?.id === nextProps.item?.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.onClick === nextProps.onClick
);

export default NeedHelpMapCard;