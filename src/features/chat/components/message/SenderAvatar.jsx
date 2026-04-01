export default function SenderAvatar({ src, alt }) {
  if (!src) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
        {String(alt || '?').slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'avatar'}
      className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
    />
  );
}