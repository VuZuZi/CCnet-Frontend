import {
  getReplyPreviewText,
  getSenderId,
  getSenderName,
} from '../../utils/message';

export default function ReplyPreview({
  replyTo,
  currentUserId,
  onJumpToMessage,
}) {
  if (!replyTo) return null;

  const repliedUserId = getSenderId(replyTo?.senderId);
  const repliedMessageId = String(replyTo?._id || '');

  let replyLabel = 'Tin nhắn gốc';

  if (repliedUserId) {
    replyLabel =
      String(repliedUserId) === String(currentUserId)
        ? 'Trả lời bạn'
        : `Trả lời ${getSenderName(replyTo?.senderId)}`;
  }

  const handleJump = () => {
    if (!repliedMessageId) return;
    onJumpToMessage?.(repliedMessageId);
  };

  return (
    <button
      type="button"
      onClick={handleJump}
      className="mb-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:bg-slate-100"
    >
      <div className="truncate text-xs font-bold text-slate-700">
        {replyLabel}
      </div>
      <div className="truncate text-xs text-slate-500">
        {getReplyPreviewText(replyTo)}
      </div>
    </button>
  );
}