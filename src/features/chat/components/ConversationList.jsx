// src/features/chat/components/ConversationList.jsx
import { useMemo } from 'react';
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
  const text = lastMsg?.text || lastMsg?.content;
  if (text && String(text).trim()) return String(text).trim();

  const atts = lastMsg?.attachments;
  if (Array.isArray(atts) && atts.length > 0) {
    const a = atts[0];
    return a?.originalName || a?.name || a?.filename || a?.fileName || '[Đính kèm]';
  }

  return '[Chưa có tin nhắn]';
}

//  Hàm lấy thông tin người gửi tin nhắn cuối
function getLastMessageSender(convo, myId) {
  const lastMsg = convo?.lastMessage;
  if (!lastMsg) return null;

  const sender = lastMsg?.sender || lastMsg?.senderId;
  if (!sender) return null;

  // Nếu sender là object có _id
  if (typeof sender === 'object') {
    return {
      name: sender?.fullName || sender?.name || sender?.email || 'Unknown',
      avatar: sender?.avatar || null,
      id: sender?._id || sender?.id
    };
  }

  // Nếu sender là string (ID)
  // Tìm trong participants để lấy thông tin
  const participants = convo?.participants || [];
  const participant = participants.find(p => String(p?._id) === String(sender));

  if (participant) {
    return {
      name: participant?.fullName || participant?.name || participant?.email || 'Unknown',
      avatar: participant?.avatar || null,
      id: participant?._id
    };
  }

  return null;
}

export function ConversationList({ onConversationSelected, searchKeyword = '' }) {
  const user = useAuthStore(authSelectors.user);

  const myId = user?._id || user?.id || user?.userId;

  const openConversation = useChatStore((s) => s.openConversation);
  const focusedConversationId = useChatStore(chatSelectors.focusedConversationId);
  const openConversationIds = useChatStore(chatSelectors.openConversationIds);

  const { conversations, isLoading, isError, errorMessage } = useConversations();
  const { markAsRead } = useMarkAsRead();

  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const filteredConversations = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];

    if (!normalizedKeyword) return list;

    return list.filter((c) => {
      const participants = c?.participants || [];
      const other =
          participants.find((p) => String(p?._id) !== String(myId)) ||
          participants[0] ||
          {};

      const name = other?.fullName || other?.email || '';
      const lastText = getLastPreview(c);

      return (
          String(name).toLowerCase().includes(normalizedKeyword) ||
          String(lastText).toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [conversations, normalizedKeyword, myId]);

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

  if (!filteredConversations.length) {
    return (
        <div className="p-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            Không tìm thấy đoạn chat phù hợp.
          </div>
        </div>
    );
  }

  return (
      <div className="flex flex-col gap-1.5 bg-white">
        {filteredConversations.map((c) => {
          const id = String(c?._id || '').trim();
          const participants = c?.participants || [];

          //  Người chat (đối tác)
          const other =
              participants.find((p) => String(p?._id) !== String(myId)) ||
              participants[0] ||
              {};

          //  Lấy thông tin người gửi tin nhắn cuối
          const lastMessageSender = getLastMessageSender(c, myId);
          const isLastMessageFromMe = lastMessageSender?.id === myId;

          //  Hiển thị tên người gửi tin nhắn cuối
          let displayName = other?.fullName || other?.email || 'Unknown';
          let displayAvatar = other?.avatar || null;
          let displayAvatarLetter = (displayName || '?').trim().slice(0, 1).toUpperCase();


          const lastText = getLastPreview(c);
          const unread = getUnreadCount(c, myId);

          const isFocused = String(focusedConversationId) === id;
          const isOpened = (openConversationIds || []).some((x) => String(x) === id);

          const handleClick = () => {
            if (!id || id.length !== 24) return;
            openConversation(id);
            markAsRead(id);
            onConversationSelected?.(id);
          };

          let stateClasses = 'bg-white border-gray-200';

          if (unread > 0) {
            stateClasses =
                'bg-amber-100 border-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.18)]';
          }

          if (isOpened && unread === 0) {
            stateClasses = 'bg-amber-50 border-amber-300';
          }

          if (isFocused) {
            stateClasses =
                'bg-amber-200 border-amber-500 outline outline-1 outline-amber-500';
          }

          return (
              <button
                  key={id}
                  type="button"
                  onClick={handleClick}
                  className={`group flex w-full items-center justify-between gap-2.5 rounded-2xl border p-3 text-left transition-colors hover:border-amber-400 hover:bg-amber-50 focus:outline-none ${stateClasses}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Avatar của người chat */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 font-extrabold text-gray-900">
                    {displayAvatar ? (
                        <img
                            src={displayAvatar}
                            alt={displayName}
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        displayAvatarLetter
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Tên người chat */}
                    <div className="truncate text-sm font-bold text-gray-900">
                      {displayName}
                    </div>

                    {/* Nội dung tin nhắn cuối - hiển thị người gửi */}
                    <div
                        className={`mt-0.5 flex items-center gap-1 truncate text-xs ${
                            unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'
                        }`}
                    >
                      {/*  Hiển thị ai đã gửi tin nhắn cuối */}
                      {lastMessageSender && !isLastMessageFromMe && (
                          <span className="font-medium text-amber-600">
                      {lastMessageSender.name}:
                    </span>
                      )}
                      {isLastMessageFromMe && (
                          <span className="font-medium text-gray-500">
                      Bạn:
                    </span>
                      )}
                      <span className="truncate">{lastText}</span>
                    </div>
                  </div>
                </div>

                {unread > 0 && (
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-black text-gray-900">
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