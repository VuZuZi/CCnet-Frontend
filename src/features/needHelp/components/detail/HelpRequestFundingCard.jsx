import { Coins, HandHeart } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/formatters';

export function HelpRequestFundingCard({ amountNeeded = 0 }) {
  const hasFundingGoal = Number(amountNeeded) > 0;

  return (
    <section
      id="funding-need"
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          <Coins size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Funding Need</h2>
          <p className="text-sm text-slate-500">
            A clear target helps organizers and donors coordinate faster.
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
          Target Goal
        </p>

        <div className="mt-4 text-4xl font-black text-slate-900 sm:text-5xl">
          {hasFundingGoal ? formatCurrency(amountNeeded) : 'Flexible Support'}
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          {hasFundingGoal
            ? 'This estimate covers the key costs described by the requester and gives CCNet organizers a concrete starting point.'
            : 'This request does not include a fixed amount yet. Volunteers can still help by reviewing the case, sharing it, or defining the budget.'}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
          <HandHeart size={16} className="text-amber-500" />
          Community hosting can turn this request into a project.
        </div>
      </div>
    </section>
  );
}
