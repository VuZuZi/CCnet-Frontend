export default function NotificationBadge({ count = 0 }) {
  if (!count) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span className="absolute -right-1 -top-1 inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-white bg-[#F59E0B] px-1.5 text-[10px] font-extrabold leading-none text-white shadow-lg shadow-[#FBBF24]/30">
      {displayCount}
    </span>
  );
}