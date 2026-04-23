import { X } from "lucide-react";

export default function FloatingAlert({
  type = "success",
  message,
  onClose,
}) {
  if (!message) return null;

  const toneMap = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className="pointer-events-none fixed inset-x-4 top-6 z-[9999] flex justify-end sm:inset-x-6">
      <div
        className={`pointer-events-auto flex w-full max-w-[460px] items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lg ${
          toneMap[type] || toneMap.success
        }`}
      >
        <p className="text-sm font-semibold leading-6">{message}</p>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cảnh báo"
          className="mt-0.5 rounded-full p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
