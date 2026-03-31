// src/features/chat/components/ChatPanel.jsx
import { useState, useMemo, useEffect } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';
import { useConversations } from '../hooks/useConversations';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useChatStore } from '../stores/useChatStore';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { X, Circle } from 'lucide-react';
import { showMessageToast } from './ToastMessage';

export function ChatPanel({ onClose, conversationId, index = 0, className = '', ...props }) {
  useChatSocket(conversationId);

  const focusConversation = useChatStore((s) => s.focusConversation);
  const openConversation = useChatStore((s) => s.openConversation);
  const [scrollSignal, setScrollSignal] = useState(0);
  const [hasShownToast, setHasShownToast] = useState(false);

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { conversations } = useConversations();

  const active = (conversations || []).find((c) => String(c?._id) === String(conversationId));
  const participants = active?.participants || [];

  // Người chat (đối tác)
  const other = participants.find((p) => String(p?._id) !== String(myId)) || participants[0] || null;

  // Lấy thông tin người gửi tin nhắn cuối
  const lastMessage = active?.lastMessage;
  const lastMessageSender = useMemo(() => {
    if (!lastMessage) return null;

    const sender = lastMessage?.sender || lastMessage?.senderId;
    if (!sender) return null;

    if (typeof sender === 'object') {
      return {
        name: sender?.fullName || sender?.name || sender?.email || 'Unknown',
        avatar: sender?.avatar || null,
        id: sender?._id || sender?.id
      };
    }

    const participant = participants.find(p => String(p?._id) === String(sender));
    if (participant) {
      return {
        name: participant?.fullName || participant?.name || participant?.email || 'Unknown',
        avatar: participant?.avatar || null,
        id: participant?._id
      };
    }

    return null;
  }, [lastMessage, participants]);

  const isLastMessageFromMe = lastMessageSender?.id === myId;

  // Hiển thị toast khi có tin nhắn mới từ người khác
  useEffect(() => {
    if (lastMessage && !isLastMessageFromMe && !hasShownToast) {
      const messageText = lastMessage?.text || lastMessage?.content || 'Đã gửi một tin nhắn';

      showMessageToast(
          {
            name: lastMessageSender?.name || 'Ai đó',
            avatar: lastMessageSender?.avatar,
          },
          messageText,
          conversationId,
          openConversation
      );

      setHasShownToast(true);
    }
  }, [lastMessage, isLastMessageFromMe, hasShownToast, conversationId, openConversation, lastMessageSender]);

  // Reset toast flag khi conversation thay đổi
  useEffect(() => {
    setHasShownToast(false);
  }, [conversationId]);

  // Hiển thị tên trong header
  const headerTitle = other?.fullName || other?.email || 'Chat';
  const headerAvatar = other?.avatar;
  const headerAvatarLetter = (headerTitle || '?').trim().slice(0, 1).toUpperCase();
  const isOnline = other?.isOnline || false;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const rightPosition = isMobile ? 10 : 120 + index * 350;
  const zIndex = 1000 + index;

  return (
      <article
          {...props}
          style={{ right: `${rightPosition}px`, zIndex }}
          className={`fixed bottom-[18px] flex h-[460px] max-h-[calc(100vh-110px)] w-[330px] max-lg:w-[calc(100vw-20px)] max-lg:max-h-none max-lg:h-[70vh] max-lg:bottom-2.5 flex-col overflow-hidden rounded-xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-transform duration-200 ease-out animate-in slide-in-from-bottom-4 ${className}`}
          onMouseDown={() => focusConversation(conversationId)}
      >
        <header className="flex h-[54px] shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-t from-amber-200 to-amber-400 px-3 shadow-[0_2px_0_rgba(17,24,39,0.06)]">
          <div className="flex items-center gap-2.5">
            {/* Avatar với online status */}
            <div className="relative">
              {headerAvatar ? (
                  <img
                      src={headerAvatar}
                      alt={headerTitle}
                      className="h-[34px] w-[34px] rounded-full border border-gray-900/15 object-cover"
                  />
              ) : (
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-gray-900/15 bg-white font-black text-gray-900">
                    {headerAvatarLetter}
                  </div>
              )}
              {isOnline && (
                  <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500 stroke-white stroke-2" />
              )}
            </div>

            <div>
              <h3 className="max-w-[180px] truncate text-sm font-black text-gray-900">
                {headerTitle}
              </h3>
              <p className="text-xs text-gray-700">
                {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
              </p>
            </div>
          </div>

          <button
              type="button"
              onClick={onClose}
              aria-label="Close Chat"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-white/65 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <section className="flex min-h-0 flex-1 flex-col bg-gray-50">
          <MessageList conversationId={conversationId} scrollSignal={scrollSignal} />
          <MessageComposer
              conversationId={conversationId}
              onSent={() => setScrollSignal((x) => x + 1)}
          />
        </section>
      </article>
  );
}