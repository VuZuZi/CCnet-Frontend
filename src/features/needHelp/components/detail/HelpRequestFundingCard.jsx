import { CircleDollarSign } from 'lucide-react';
import { formatVND } from '@/shared/lib/formatters';

function formatCompactVND(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Flexible Support';
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

function StatRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-slate-100 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

export function HelpRequestFundingCard({ amountNeeded = 0 }) {
  const amount = Number(amountNeeded || 0);
  const hasFundingGoal = amount > 0;
  const compactAmount = formatCompactVND(amount);
  const fullAmount = hasFundingGoal ? formatVND(amount) : 'Not specified';

  return (
    <section
      id="funding-need"
      className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 ring-1 ring-emerald-200">
        <CircleDollarSign size={13} />
        Funding Need
      </div>

      <div className="mt-5 rounded-[24px] bg-slate-950 px-5 py-6 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Estimated Goal
        </p>
        <div className="mt-3 break-words text-3xl font-black leading-none tracking-tight sm:text-[38px]">
          {compactAmount}
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          {hasFundingGoal
            ? 'This amount reflects the requester’s submitted needs and supporting details.'
            : 'No fixed amount has been set yet, so support remains flexible.'}
        </p>
      </div>

      <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
        <StatRow
          label="Support type"
          value={hasFundingGoal ? 'Fixed target' : 'Flexible support'}
        />
        <StatRow label="Full amount" value={fullAmount} />
      </div>
    </section>
  );
}

export default HelpRequestFundingCard;