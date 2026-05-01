import React from "react";
import { formatProjectCurrencyVND } from "@/features/project/utils/projectDisplay.utils";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  WalletCards,
} from "lucide-react";

export function AdminFinanceEscrowCard({ escrow }) {
  const {
    availableBalance,
    totalDeposited,
    totalDisbursed,
    pendingDisbursementAmount,
  } = escrow || {};

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <FinanceStat
        icon={Landmark}
        tone="slate"
        label="Quỹ hiện có"
        value={formatProjectCurrencyVND(availableBalance)}
      />
      <FinanceStat
        icon={ArrowDownCircle}
        tone="emerald"
        label="Tổng đóng góp"
        value={formatProjectCurrencyVND(totalDeposited)}
      />
      <FinanceStat
        icon={ArrowUpCircle}
        tone="sky"
        label="Đã giải ngân"
        value={formatProjectCurrencyVND(totalDisbursed)}
      />
      <FinanceStat
        icon={WalletCards}
        tone="amber"
        label="Đang chờ giải ngân"
        value={formatProjectCurrencyVND(pendingDisbursementAmount)}
      />
    </div>
  );
}

function FinanceStat({ icon: Icon, tone, label, value }) {
  const toneMap = {
    slate:
      "border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] text-slate-900",
    emerald:
      "border-emerald-100 bg-[linear-gradient(180deg,#F0FDF4_0%,#FFFFFF_100%)] text-emerald-900",
    sky: "border-sky-100 bg-[linear-gradient(180deg,#F0F9FF_0%,#FFFFFF_100%)] text-sky-900",
    amber:
      "border-amber-100 bg-[linear-gradient(180deg,#FFF7ED_0%,#FFFFFF_100%)] text-amber-900",
  };

  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm ${toneMap[tone] || toneMap.slate}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <h3 className="mt-3 text-2xl font-black tracking-tight">{value}</h3>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
