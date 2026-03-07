import { useConversations } from '../hooks/useConversations';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useChatStore, chatSelectors } from '../stores/useChatStore';
import { useMarkAsRead } from '../hooks/useMarkAsRead';

function getUnreadCount(convo, userId) {
  const uc = convo?.unreadCounts;
  if (!uc || !userId) return 0;
  if (typeof uc.get === 'function') return uc.get(String(userId)) || 0;
  return uc[String(userId)] || 0;
}

function getLastPreview(convo) {
  const lastMsg = convo?.lastMessage;
  const text = lastMsg?.text;
  if (text && String(text).trim()) return String(text).trim();

  const atts = lastMsg?.attachments;
  if (Array.isArray(atts) && atts.length > 0) {
    const a = atts[0];
    return a?.originalName || a?.name || a?.filename || a?.fileName || '[Đính kèm]';
  }

  return '[Chưa có tin nhắn]';
}

export function ConversationList() {
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const openConversation = useChatStore((s) => s.openConversation);
  const focusedConversationId = useChatStore(chatSelectors.focusedConversationId);
  const openConversationIds = useChatStore(chatSelectors.openConversationIds);

  const { conversations, isLoading, isError, errorMessage } = useConversations();
  const { markAsRead } = useMarkAsRead();

  if (!user || isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#f6c343] border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-3">
        <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
          {errorMessage || 'Lỗi tải danh sách chat'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 bg-white">
      {(conversations || []).map((c) => {
        const id = String(c?._id || '').trim();
        const participants = c?.participants || [];
        const other = participants.find((p) => String(p?._id) !== String(myId)) || participants[0] || {};

        const lastText = getLastPreview(c);
        const unread = getUnreadCount(c, myId);

        const name = other?.fullName || other?.email || 'Unknown';
        const avatarLetter = (name || '?').trim().slice(0, 1).toUpperCase();

        const isFocused = String(focusedConversationId) === id;
        const isOpened = (openConversationIds || []).some((x) => String(x) === id);

        const handleClick = () => {
          if (!id || id.length !== 24) return;
          openConversation(id);
          markAsRead(id);
        };

        let stateClasses = "bg-[#ffe08a] border-[#f6c343]";
        if (isFocused) {
          stateClasses = "bg-[#f6c343] border-[#f1b90b] outline outline-1 outline-[#f1b90b]";
        } else if (isOpened) {
          stateClasses = "bg-[#ffd66b] border-[#f6c343]";
        }

        return (
          <button
            key={id}
            type="button"
            onClick={handleClick}
            className={`group flex w-full items-center justify-between gap-2.5 rounded-xl border p-2.5 text-left transition-colors hover:border-[#f1b90b] hover:bg-[#ffd66b] focus:outline-none ${stateClasses}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white font-extrabold text-gray-900">
                {avatarLetter}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-gray-900">{name}</div>
                <div className="mt-0.5 truncate text-xs text-gray-500">{lastText}</div>
              </div>
            </div>

            {unread > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f6c343] px-1.5 text-xs font-extrabold text-gray-900">
                {unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ConversationList;