import { FileText } from "lucide-react";

export function OrganizerDocumentField({
  label,
  description,
  value,
  accept = "image/*,.pdf",
  onSelect,
  error,
}) {
  return (
    <div>
      <label className="block cursor-pointer">
        <div className="rounded-[22px] border-2 border-dashed border-slate-300 bg-white px-4 py-7 text-center transition hover:bg-slate-50">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileText size={18} />
          </div>

          <div className="text-sm font-semibold text-slate-800">{label}</div>
          <div className="mt-1 text-xs text-slate-500">{description}</div>

          {value?.fileName ? (
            <p className="mt-3 break-all text-xs font-medium text-emerald-600">
              {value.fileName}
            </p>
          ) : null}
        </div>

        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onSelect?.(e.target.files?.[0] || null)}
        />
      </label>

      {error ? <p className="mt-2 text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}

export default OrganizerDocumentField;