import { memo } from 'react';
import { CheckCheck, Users } from 'lucide-react';
import {
  getConversationAvatarData,
  getConversationTitle,
  getLastPreview,
  getUnreadCount,
} from '../../utils/conversation';

function ConversationAvatar({ conversation, myId }) {
  const avatar = getConversationAvatarData(conversation, myId);

  if (avatar.src) {
    return (
      <img
        src={avatar.src}
        alt="avatar"
        className="h-11 w-11 shrink-0 rounded-full border border-gray-200 bg-white object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white font-black text-gray-900">
      {avatar.isGroup ? <Users className="h-5 w-5" /> : avatar.label}
    </div>
  );
}

function ConversationListItemComponent({
  conversation,
  myId,
  isActive = false,
  onSelect,
}) {
  const conversationId = String(conversation?._id || '');
  const unread = getUnreadCount(conversation, myId);
  const title = getConversationTitle(conversation, myId);
  const preview = getLastPreview(conversation);

  const handleSelect = () => {
    if (!conversationId) return;
    onSelect?.(conversation);
  };

  return (
    <div
      className={`group relative rounded-2xl border transition ${
        isActive
          ? 'border-amber-300 bg-amber-50'
          : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect();
          }
        }}
        className="flex cursor-pointer items-center gap-3 px-3 py-3"
      >
        <ConversationAvatar conversation={conversation} myId={myId} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm font-bold text-slate-900">
              {title}
            </div>

            {unread > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                {unread}
              </span>
            ) : (
              <CheckCheck className="h-4 w-4 text-slate-300" />
            )}
          </div>

          <div className="truncate text-xs text-slate-500">
            {preview}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ConversationListItem = memo(ConversationListItemComponent);
export default ConversationListItem;