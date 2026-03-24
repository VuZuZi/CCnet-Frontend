const STATUS_TONE = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  DECLINED: 'bg-rose-100 text-rose-700',
};

export function OrganizerRequestStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        STATUS_TONE[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {status || 'UNKNOWN'}
    </span>
  );
}

export default OrganizerRequestStatusBadge;