import { Paperclip, X } from "lucide-react";
import { formatChatFileSize } from "@/features/chat/utils/chatUpload.validate";

export function ComposerFilePreviewList({ previewItems = [], onRemove }) {
  if (!Array.isArray(previewItems) || !previewItems.length) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {previewItems.map((item, idx) =>
        item.isImage ? (
          <div
            key={`${item.file.name}-${idx}`}
            className="group relative h-20 w-20 overflow-hidden rounded-xl border border-amber-200"
          >
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={() => onRemove?.(idx)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            key={`${item.file.name}-${idx}`}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#ffe08a] bg-[#fff6d6] px-2.5 py-2 text-xs text-gray-900"
          >
            <Paperclip className="h-4 w-4 shrink-0" />

            <div className="min-w-0">
              <div className="max-w-[180px] truncate font-medium">{item.file.name}</div>
              <div className="text-[11px] text-slate-500">
                {formatChatFileSize(item.file.size)}
              </div>
            </div>

            <button
              type="button"
              className="text-sm font-bold text-gray-900 hover:text-red-600"
              onClick={() => onRemove?.(idx)}
            >
              ✕
            </button>
          </div>
        )
      )}
    </div>
  );
}

export default ComposerFilePreviewList;