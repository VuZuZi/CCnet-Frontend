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

export function HelpRequestFundingCard({ amountNeeded = 0 }) {
  const hasFundingGoal = Number(amountNeeded) > 0;
  const compactAmount = formatCompactVND(amountNeeded);
  const fullAmount = hasFundingGoal ? formatVND(amountNeeded) : null;

  return (
    <section
      id="funding-need"
      className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">
            <CircleDollarSign size={13} />
            Funding Need
          </div>

          <h2 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
            Funding Overview
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            A clear amount helps organizers and donors respond faster.
          </p>
        </div>

        <div className="rounded-[22px] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 px-5 py-4 text-left shadow-sm lg:min-w-[320px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Target Goal
          </p>

          <div className="mt-2 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {compactAmount}
          </div>

          {fullAmount && fullAmount !== compactAmount ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Full amount: {fullAmount}
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {hasFundingGoal
                ? 'Estimated from the requester’s submitted needs and evidence.'
                : 'No fixed amount yet.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default HelpRequestFundingCard;