import { memo, useMemo, useState } from 'react';
import SystemMessage from './SystemMessage';
import SenderAvatar from './SenderAvatar';
import SeenAvatars from './SeenAvatars';
import MessageActionsMenu from './MessageActionsMenu';
import AttachmentPreviewModal from './AttachmentPreviewModal';
import MessageBubbleContent from './MessageBubbleContent';
import {
  getSenderId,
  getSenderName,
  isSystemMessage,
} from '../../utils/message';
import { useMessageBubbleActions } from '../../hooks/messages/useMessageBubbleActions';

function getBubbleLayout({ mine, compact }) {
  return {
    bubbleMaxWidth: compact ? 'max-w-[88%]' : 'max-w-[78%]',
    bubblePadding: compact ? 'px-3 py-2.5' : 'px-4 py-3',
    bubbleRadius: compact ? 'rounded-[22px]' : 'rounded-[26px]',
    actionPositionClass: mine
      ? compact
        ? 'right-1 top-[calc(100%+4px)]'
        : 'right-1 top-[calc(100%+6px)]'
      : compact
        ? 'left-0 top-[calc(100%+2px)]'
        : 'left-0 top-[calc(100%+3px)]',
  };
}

function getDisplayStatus({ mine, message, deliveryStatus, showSeenAvatars, seenUsers }) {
  if (!mine || message?.isUnsent) return '';

  const normalizedStatus = String(
    deliveryStatus || message?.status || (message?.__optimistic ? 'sending' : '')
  ).toLowerCase();

  const hasSeenUsers = Array.isArray(seenUsers) && seenUsers.length > 0;

  if (normalizedStatus === 'seen' || (showSeenAvatars && hasSeenUsers)) {
    return '';
  }

  if (normalizedStatus === 'delivered') {
    return 'Đã chuyển';
  }

  if (normalizedStatus === 'sent') {
    return 'Đã gửi';
  }

  if (normalizedStatus === 'sending') {
    return 'Đang gửi...';
  }

  return '';
}

function MessageBubbleComponent({
  message,
  conversationId,
  currentUserId,
  compact = false,
  showSenderName = false,
  showSenderAvatar = false,
  showSeenAvatars = false,
  showDeliveryStatus = false,
  deliveryStatus = null,
  seenUsers = [],
  onJumpToMessage,
}) {
  const [previewAttachment, setPreviewAttachment] = useState(null);

  if (isSystemMessage(message)) {
    return (
      <SystemMessage
        message={message}
        currentUserId={currentUserId}
      />
    );
  }

  const senderId = getSenderId(message?.senderId);
  const mine = String(senderId) === String(currentUserId);
  const senderName = getSenderName(message?.senderId);
  const senderAvatar = message?.senderId?.avatar || '';

  const {
    bubbleMaxWidth,
    bubblePadding,
    bubbleRadius,
    actionPositionClass,
  } = useMemo(() => getBubbleLayout({ mine, compact }), [mine, compact]);

  const displayStatus = useMemo(
    () =>
      getDisplayStatus({
        mine,
        message,
        deliveryStatus,
        showSeenAvatars,
        seenUsers,
      }),
    [mine, message, deliveryStatus, showSeenAvatars, seenUsers]
  );

  const {
    showActions,
    handleReply,
    handleReact,
    handleUnsend,
    openActions,
    scheduleCloseActions,
    handleBlurCapture,
  } = useMessageBubbleActions({
    conversationId,
    message,
  });

  return (
    <>
      <div
        className={`${compact ? 'mb-2' : 'mb-3'} flex overflow-visible ${
          mine ? 'justify-end' : 'justify-start'
        }`}
        data-message-id={String(message?._id || '')}
      >
        <div
          className={`relative flex ${bubbleMaxWidth} items-end gap-2 overflow-visible ${
            mine ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {!mine ? (
            showSenderAvatar ? (
              <SenderAvatar src={senderAvatar} alt={senderName} />
            ) : (
              <div className="w-9 shrink-0" />
            )
          ) : (
            <div className="w-9 shrink-0" />
          )}

          <div className="min-w-0 flex-1 overflow-visible">
            {!mine && showSenderName ? (
              <div
                className={`px-1 font-semibold text-slate-500 ${
                  compact ? 'mb-0.5 text-[11px]' : 'mb-1 text-xs'
                }`}
              >
                {senderName}
              </div>
            ) : null}

            <div
              className="relative inline-block max-w-full overflow-visible"
              onMouseEnter={openActions}
              onMouseLeave={scheduleCloseActions}
              onFocusCapture={openActions}
              onBlurCapture={handleBlurCapture}
            >
              <div
                className={`${bubbleRadius} ${bubblePadding} shadow-sm ring-1 ${
                  mine
                    ? 'bg-amber-100 text-slate-900 ring-amber-200'
                    : 'bg-white text-slate-900 ring-slate-200'
                }`}
              >
                <MessageBubbleContent
                  message={message}
                  currentUserId={currentUserId}
                  compact={compact}
                  onPreviewImage={setPreviewAttachment}
                  onReact={handleReact}
                  onJumpToMessage={onJumpToMessage}
                />
              </div>

              {!message?.isUnsent ? (
                <div
                  className={`absolute z-30 max-w-none ${actionPositionClass} transition-all duration-150 ease-out ${
                    showActions
                      ? 'pointer-events-auto translate-y-0 opacity-100'
                      : 'pointer-events-none translate-y-1 opacity-0'
                  }`}
                >
                  <div className="absolute left-0 right-0 -top-3 h-3" />

                  <MessageActionsMenu
                    canReply
                    canUnsend={mine}
                    onReply={handleReply}
                    onUnsend={handleUnsend}
                    onReact={handleReact}
                    compact={compact}
                    align={mine ? 'right' : 'left'}
                    variant={mine ? 'mine' : 'incoming'}
                    onMouseEnter={openActions}
                    onMouseLeave={scheduleCloseActions}
                  />
                </div>
              ) : null}
            </div>

            {mine && (showDeliveryStatus || (showSeenAvatars && deliveryStatus)) ? (
              <div className="mt-1 flex items-center justify-end gap-2 pr-1">
                {showDeliveryStatus && displayStatus ? (
                  <div className={`text-slate-500 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
                    {displayStatus}
                  </div>
                ) : null}

                {showSeenAvatars && deliveryStatus ? (
                  <SeenAvatars
                    users={seenUsers}
                    status={deliveryStatus}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {previewAttachment ? (
        <AttachmentPreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      ) : null}
    </>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
export default MessageBubble;