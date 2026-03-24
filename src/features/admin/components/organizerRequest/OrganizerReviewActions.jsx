import { useState } from 'react';

export function OrganizerReviewActions({
  status,
  onApprove,
  onDecline,
  isApproving,
  isDeclining,
}) {
  const [reason, setReason] = useState('');

  const isReadonly = status !== 'PENDING';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Final Decision</h3>
      <p className="mt-2 text-sm text-slate-500">
        Review the application carefully before approving or declining.
      </p>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
          Decline Reason
        </label>
        <textarea
          rows={4}
          disabled={isReadonly}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do từ chối nếu không duyệt..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400 disabled:bg-slate-100"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isReadonly || isApproving}
          onClick={onApprove}
          className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isApproving ? 'Approving...' : 'Approve Organizer'}
        </button>

        <button
          type="button"
          disabled={isReadonly || isDeclining}
          onClick={() => onDecline(reason)}
          className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeclining ? 'Declining...' : 'Decline Application'}
        </button>

        {isReadonly ? (
          <span className="text-xs font-semibold text-slate-400">
            Hồ sơ này đã được xử lý.
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default OrganizerReviewActions;