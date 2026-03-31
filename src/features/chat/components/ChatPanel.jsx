// src/features/chat/components/ChatPanel.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';
import { useConversations } from '../hooks/useConversations';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useChatStore } from '../stores/useChatStore';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { X, Circle, Minimize2 } from 'lucide-react';
import { showMessageToast } from './ToastMessage';

export function ChatPanel({ onClose, conversationId, index = 0, className = '', ...props }) {
  useChatSocket(conversationId);

  const focusConversation = useChatStore((s) => s.focusConversation);
  const openConversation = useChatStore((s) => s.openConversation);
  const [scrollSignal, setScrollSignal] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Dùng ref để track last message ID và tránh toast trùng
  const lastToastMessageIdRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { conversations, refetch } = useConversations();

  const active = (conversations || []).find((c) => String(c?._id) === String(conversationId));
  const participants = active?.participants || [];

  // Người chat (đối tác)
  const other = participants.find((p) => String(p?._id) !== String(myId)) || participants[0] || null;

  // Lấy số lượng tin nhắn chưa đọc
  useEffect(() => {
    if (active?.unreadCounts?.[myId]) {
      setUnreadCount(active.unreadCounts[myId]);
    } else {
      setUnreadCount(0);
    }
  }, [active, myId]);

  // Lấy thông tin người gửi tin nhắn cuối
  const lastMessage = active?.lastMessage;
  const lastMessageId = lastMessage?._id;

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

  // ✅ Hiển thị toast khi có tin nhắn mới - chỉ 1 lần cho mỗi tin nhắn
  useEffect(() => {
    // Không hiển thị nếu:
    // - Không có tin nhắn
    // - Tin nhắn là của mình
    // - Đã hiển thị toast cho tin nhắn này rồi
    if (!lastMessage || isLastMessageFromMe || lastToastMessageIdRef.current === lastMessageId) {
      return;
    }

    // Xóa timeout cũ nếu có
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    const messageText = lastMessage?.text || lastMessage?.content || 'Đã gửi một tin nhắn';
    const newUnreadCount = active?.unreadCounts?.[myId] || 0;

    // ✅ Lưu ID tin nhắn đã toast
    lastToastMessageIdRef.current = lastMessageId;

    // Hiển thị toast
    showMessageToast(
        {
          name: lastMessageSender?.name || 'Ai đó',
          avatar: lastMessageSender?.avatar,
        },
        messageText,
        conversationId,
        openConversation,
        newUnreadCount
    );

    // ✅ Reset sau 3 giây để có thể toast cho tin nhắn tiếp theo
    toastTimeoutRef.current = setTimeout(() => {
      lastToastMessageIdRef.current = null;
    }, 3000);

  }, [lastMessageId, lastMessage, isLastMessageFromMe, active, myId, conversationId, openConversation, lastMessageSender]);

  // Reset khi conversation thay đổi
  useEffect(() => {
    lastToastMessageIdRef.current = null;
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
  }, [conversationId]);

  // Đánh dấu đã đọc khi mở chat
  useEffect(() => {
    if (!isMinimized && unreadCount > 0) {
      const markAsRead = async () => {
        try {
          await fetch(`/api/v1/chat/conversations/${conversationId}/read`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          setUnreadCount(0);
          refetch();
        } catch (error) {
          console.error('Mark as read error:', error);
        }
      };
      markAsRead();
    }
  }, [isMinimized, unreadCount, conversationId, refetch]);

  // Hiển thị tên trong header
  const headerTitle = other?.fullName || other?.email || 'Chat';
  const headerAvatar = other?.avatar;
  const headerAvatarLetter = (headerTitle || '?').trim().slice(0, 1).toUpperCase();
  const isOnline = other?.isOnline || false;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const rightPosition = isMobile ? 10 : 120 + index * 350;
  const zIndex = 1000 + index;

  // Lấy tin nhắn cuối để hiển thị trên bong bóng
  const lastMessageText = lastMessage?.text || lastMessage?.content || '';
  const lastMessagePreview = lastMessageText.length > 30
      ? lastMessageText.substring(0, 30) + '...'
      : lastMessageText;

  // Nếu đang thu gọn, hiển thị bong bóng
  if (isMinimized) {
    return (
        <div
            className="fixed bottom-[18px] cursor-pointer group"
            style={{ right: `${rightPosition}px`, zIndex }}
            onClick={() => setIsMinimized(false)}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg flex items-center justify-center hover:scale-105 transition-transform duration-200">
              {headerAvatar ? (
                  <img
                      src={headerAvatar}
                      alt={headerTitle}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
              ) : (
                  <span className="text-white font-bold text-xl">
                {headerAvatarLetter}
              </span>
              )}
              {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Badge tin nhắn chưa đọc */}
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            )}

            {/* Tooltip preview */}
            {lastMessageText && (
                <div className="absolute -top-10 right-0 bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                  {lastMessagePreview || 'Tin nhắn mới'}
                </div>
            )}
          </div>
        </div>
    );
  }

  return (
      <article
          {...props}
          style={{ right: `${rightPosition}px`, zIndex }}
          className={`fixed bottom-[18px] flex h-[460px] max-h-[calc(100vh-110px)] w-[330px] max-lg:w-[calc(100vw-20px)] max-lg:max-h-none max-lg:h-[70vh] max-lg:bottom-2.5 flex-col overflow-hidden rounded-xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-transform duration-200 ease-out animate-in slide-in-from-bottom-4 ${className}`}
          onMouseDown={() => focusConversation(conversationId)}
      >
        <header className="flex h-[54px] shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-t from-amber-200 to-amber-400 px-3 shadow-[0_2px_0_rgba(17,24,39,0.06)]">
          <div className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimize Chat"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-white/65 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <Minimize2 className="h-5 w-5" />
            </button>

            <button
                type="button"
                onClick={onClose}
                aria-label="Close Chat"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-white/65 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {unreadCount > 0 && (
            <div className="bg-amber-50 px-3 py-1.5 text-center text-xs text-amber-700 border-b border-amber-100">
              <span className="font-medium">{unreadCount}</span> tin nhắn chưa đọc
            </div>
        )}

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