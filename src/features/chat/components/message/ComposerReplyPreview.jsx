import { CornerUpLeft, X } from 'lucide-react';
import {
  getReplyPreviewText,
  getSenderName,
} from '../../utils/message';

export default function ComposerReplyPreview({
  replyingTo,
  onClear,
}) {
  if (!replyingTo) return null;

  return (
    <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-0.5 flex items-center gap-1 text-xs font-semibold text-amber-700">
            <CornerUpLeft className="h-3.5 w-3.5" />
            Đang trả lời {getSenderName(replyingTo?.senderId)}
          </div>

          <div className="truncate text-sm text-slate-700">
            {getReplyPreviewText(replyingTo)}
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-slate-800"
          aria-label="Huỷ trả lời"
          title="Huỷ trả lời"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}