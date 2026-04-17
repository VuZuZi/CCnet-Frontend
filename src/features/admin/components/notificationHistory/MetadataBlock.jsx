import { ChevronDown, ChevronUp } from "lucide-react";
import { formatLogDate } from "../../utils/adminNotificationHistory.utils";

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value || "--"}
      </p>
    </div>
  );
}

export default function MetadataBlock({ item, isExpanded, onToggle }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="text-sm font-black tracking-tight text-slate-900">
            Siêu dữ liệu kiểm tra
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Chi tiết nhật ký kỹ thuật dành cho quản trị viên xem xét và gỡ lỗi.
          </p>
        </div>

        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {isExpanded ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoRow label="Mã nhật ký" value={item?._id || "--"} />
          <InfoRow label="Hành động" value={item?.action || "--"} />
          <InfoRow label="Loại mục tiêu" value={item?.targetType || "--"} />
          <InfoRow label="Mã mục tiêu" value={item?.targetId || "--"} />
          <InfoRow label="Tạo lúc" value={formatLogDate(item?.createdAt)} />
          <InfoRow label="Vai trò người thực hiện" value={item?.actorRole || "--"} />
        </div>
      ) : null}
    </div>
  );
}