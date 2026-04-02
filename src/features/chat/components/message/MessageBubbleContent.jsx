import ReplyPreview from './ReplyPreview';
import ReactionBar from './ReactionBar';
import MessageAttachments from './MessageAttachments';
import { formatMessageTime } from '../../utils/message';

export function MessageBubbleContent({
  message,
  currentUserId,
  compact = false,
  onPreviewImage,
  onReact,
  onJumpToMessage,
}) {
  return (
    <>
      {message?.replyTo ? (
        <ReplyPreview
          replyTo={message.replyTo}
          currentUserId={currentUserId}
          onJumpToMessage={onJumpToMessage}
        />
      ) : null}

      {message?.isUnsent ? (
        <div className={`${compact ? 'text-[13px]' : 'text-sm'} italic text-slate-500`}>
          Tin nhắn đã được thu hồi
        </div>
      ) : (
        <>
          {message?.text ? (
            <div
              className={`whitespace-pre-wrap break-words ${
                compact ? 'text-[13px] leading-5' : 'text-sm leading-6'
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <MessageAttachments
            attachments={message?.attachments || []}
            onPreviewImage={onPreviewImage}
            compact={compact}
          />
        </>
      )}

      <div className={`mt-2 text-slate-500 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
        {formatMessageTime(message?.createdAt)}
      </div>

      {!message?.isUnsent ? (
        <ReactionBar
          reactions={message?.reactions || []}
          currentUserId={currentUserId}
          onReact={onReact}
        />
      ) : null}
    </>
  );
}

export default MessageBubbleContent;