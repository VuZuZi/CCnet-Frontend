import { Sparkles, Wallet, Users } from "lucide-react";
import {
  formatSidebarCurrency,
} from "./utils/projectSidebar.utils";

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
  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/25 bg-[#FFFBEB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B45309]">
            <Sparkles size={11} />
            Public Support
          </div>
          <h3 className="text-lg font-bold text-slate-900">Support this project</h3>
        </div>
      </div>

      <div className="space-y-4">
        {isFunded && !isVolunteerOnly ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
              Funds raised
            </p>
            <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {formatSidebarCurrency(availableBalance)}đ
            </div>
            {pendingRefunds > 0 ? (
              <p className="mt-1 text-xs font-medium text-amber-600">
                ({formatSidebarCurrency(pendingRefunds)}đ đang chờ hoàn trả)
              </p>
            ) : null}
            <p className="mt-1 text-sm text-slate-500">
              Goal: {formatSidebarCurrency(targetAmount)}đ
            </p>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="relative h-full rounded-full bg-[linear-gradient(90deg,#FBBF24_0%,#F59E0B_100%)] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20" />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
              Volunteers Recruited
            </p>
            <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {currentVolunteers.toLocaleString("vi-VN")}{" "}
              <span className="text-lg font-medium text-slate-500">
                / {targetVolunteers}
              </span>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="relative h-full rounded-full bg-[linear-gradient(90deg,#34D399_0%,#059669_100%)] transition-all duration-1000"
                style={{ width: `${volunteerPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {isFunded ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                <Wallet size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{progressPercent}%</p>
              <p className="mt-1 text-sm font-medium text-slate-500">Funded</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <Users size={18} />
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {currentVolunteers.toLocaleString("vi-VN")}
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-600">Volunteers</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SidebarStatsCard;