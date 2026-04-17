import { Sparkles, Wallet, Users, Target } from "lucide-react";
import { formatSidebarCurrency } from "./utils/projectSidebar.utils";

function formatCompactCurrency(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "0đ";
  }

  if (amount >= 1_000_000_000_000) {
    return `${(amount / 1_000_000_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} nghìn tỷ`;
  }

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} tỷ`;
  }

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    })} triệu`;
  }

  if (amount >= 1_000) {
    return `${(amount / 1_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    })} nghìn`;
  }

  return `${formatSidebarCurrency(amount)}đ`;
}

function LargeCurrencyBlock({ value, className = "" }) {
  return (
    <div className={`min-w-0 overflow-hidden ${className}`}>
      <p className="truncate text-3xl font-black leading-tight tracking-tight sm:text-4xl">
        {formatSidebarCurrency(value)}đ
      </p>
    </div>
  );
}

function CompactCurrencyBlock({ value, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p
        className="text-[28px] font-black leading-none tracking-tight text-amber-800"
        title={`${formatSidebarCurrency(value)}đ`}
      >
        {formatCompactCurrency(value)}
      </p>
    </div>
  );
}

export function SidebarStatsCard({
  isFunded,
  isVolunteerOnly,
  availableBalance,
  targetAmount,
  pendingRefunds,
  progressPercent,
  currentVolunteers,
  targetVolunteers,
  volunteerPercent,
}) {
  const showFundingBlock = isFunded && !isVolunteerOnly;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/25 bg-[#FFFBEB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B45309]">
            <Sparkles size={11} />
            Public Support
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            Support this project
          </h3>
        </div>
      </div>

      {showFundingBlock ? (
        <div className="rounded-[26px] border border-slate-100 bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            Funds raised
          </p>

          <LargeCurrencyBlock value={availableBalance} className="mt-2 text-slate-900" />

          {pendingRefunds > 0 ? (
            <p className="mt-1 truncate text-xs font-medium text-amber-600">
              {formatSidebarCurrency(pendingRefunds)}đ đang chờ hoàn trả
            </p>
          ) : null}

          <p className="mt-2 truncate text-sm text-slate-500">
            Goal: {formatSidebarCurrency(targetAmount)}đ
          </p>

          <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#FBBF24_0%,#F59E0B_100%)] transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700 shadow-sm">
                <Wallet size={18} />
              </div>
              <p className="truncate text-2xl font-black leading-tight text-slate-900">
                {progressPercent}%
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">Đã đạt</p>
            </div>

            <div className="min-w-0 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                <Target size={18} />
              </div>

              <CompactCurrencyBlock value={targetAmount} />

              <p
                className="mt-2 text-xs font-medium text-amber-700/90"
                title={`${formatSidebarCurrency(targetAmount)}đ`}
              >
                {formatSidebarCurrency(targetAmount)}đ
              </p>

              <p className="mt-1 text-sm font-medium text-amber-700">Mục tiêu</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[26px] border border-slate-100 bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            Volunteers Recruited
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black tracking-tight text-slate-900">
              {currentVolunteers.toLocaleString("vi-VN")}
            </span>
            <span className="pb-1 text-xl font-semibold text-slate-400">
              / {targetVolunteers}
            </span>
          </div>

          <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#34D399_0%,#059669_100%)] transition-all duration-700"
              style={{ width: `${volunteerPercent}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <Users size={18} />
              </div>
              <p className="truncate text-2xl font-black leading-tight text-emerald-700">
                {currentVolunteers.toLocaleString("vi-VN")}
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-600">Đã tham gia</p>
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700 shadow-sm">
                <Target size={18} />
              </div>
              <p className="truncate text-2xl font-black leading-tight text-slate-900">
                {targetVolunteers.toLocaleString("vi-VN")}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">Mục tiêu</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SidebarStatsCard;