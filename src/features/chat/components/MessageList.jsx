// src/features/chat/components/MessageList.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useMessages } from '../hooks/useMessages';
import { useConversations } from '../hooks/useConversations';
import { MessageBubble } from './MessageBubble';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

function getSenderId(sender) {
  if (!sender) return '';
  if (typeof sender === 'string') return String(sender);
  return String(sender?._id || sender?.userId || sender?.id || '');
}

// ✅ Cải thiện hàm lấy thông tin người gửi
function getSenderInfo(senderId, participants = []) {
  if (!senderId) return { name: 'Unknown', avatar: null };

  // Tìm trong participants
  const participant = participants.find(p => String(p?._id) === String(senderId));

  if (participant) {
    return {
      name: participant?.fullName || participant?.name || participant?.email || 'Unknown',
      avatar: participant?.avatar || null,
    };
  }

  return { name: 'Unknown', avatar: null };
}

function dedupeMessages(messages = []) {
  const map = new Map();

  for (const msg of messages) {
    const realId = msg?._id ? String(msg._id) : '';

    if (realId) {
      map.set(realId, msg);
      continue;
    }

    const fallbackKey = [
      getSenderId(msg?.senderId),
      String(msg?.content || msg?.text || ''),
      String(msg?.createdAt || ''),
      msg?.__optimistic ? 'optimistic' : 'normal',
    ].join('__');

    if (!map.has(fallbackKey)) {
      map.set(fallbackKey, msg);
    }
  }

  return Array.from(map.values());
}

// Format thời gian hiển thị
function formatMessageTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return format(date, 'HH:mm');
  }
  return format(date, 'dd/MM/yyyy HH:mm');
}

// Nhóm tin nhắn theo ngày
function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;
  let currentGroup = null;

  messages.forEach((msg) => {
    if (!msg?.createdAt) return;

    const msgDate = new Date(msg.createdAt);
    const dateKey = format(msgDate, 'dd/MM/yyyy');

    if (dateKey !== currentDate) {
      currentDate = dateKey;
      currentGroup = {
        date: dateKey,
        dateObject: msgDate,
        messages: []
      };
      groups.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  });

  return groups;
}

export function MessageList({ conversationId, scrollSignal }) {
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { messages, isLoading } = useMessages(conversationId);

  // ✅ Lấy participants từ conversation
  const { conversations } = useConversations();
  const activeConversation = (conversations || []).find(c => String(c?._id) === String(conversationId));
  const participants = activeConversation?.participants || [];

  const listRef = useRef(null);
  const endRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const safeMessages = useMemo(() => {
    const arr = Array.isArray(messages) ? messages : [];
    return dedupeMessages(arr);
  }, [messages]);

  // Nhóm tin nhắn theo ngày
  const messageGroups = useMemo(() => {
    return groupMessagesByDate(safeMessages);
  }, [safeMessages]);

  const scrollToBottom = (behavior = 'smooth') => {
    endRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  // Kiểm tra vị trí scroll để hiển thị nút cuộn xuống
  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    setShowScrollButton(!isNearBottom);
  };

  useEffect(() => {
    if (!conversationId || isLoading) return;
    scrollToBottom('auto');
  }, [conversationId, isLoading]);

  useEffect(() => {
    if (!conversationId || safeMessages.length === 0) return;

    const el = listRef.current;
    if (!el) return;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom || scrollSignal) {
      scrollToBottom('smooth');
    }
  }, [safeMessages.length, scrollSignal, conversationId]);

  if (!conversationId) {
    return (
        <div className="flex min-h-0 flex-1 grid-cols-1 place-items-center bg-[#f6f7fb] p-5 text-center">
          <div>
            <div className="mb-1.5 font-black text-gray-900">Chọn một liên hệ</div>
            <div className="text-xs text-gray-500">Bấm vào người bên phải để mở hộp chat.</div>
          </div>
        </div>
    );
  }

  if (isLoading) {
    return (
        <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f6f7fb]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
    );
  }

  return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[#f6f7fb] p-3 [scrollbar-color:rgba(17,24,39,0.2)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-900/20 [&::-webkit-scrollbar]:w-1.5"
        >
          {messageGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-3">
                {/* Date Separator */}
                <div className="flex justify-center">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {group.date}
              </span>
                </div>

                {/* Messages in this date group */}
                {group.messages.map((msg, msgIdx) => {
                  const senderId = getSenderId(msg?.senderId);
                  const isMine = String(senderId) === String(myId);
                  // ✅ Lấy thông tin người gửi từ participants
                  const senderInfo = getSenderInfo(senderId, participants);

                  const reactKey = msg?._id
                      ? String(msg._id)
                      : `fallback_${senderId}_${String(msg?.createdAt || '')}_${msgIdx}`;

                  const showAvatar = !isMine;
                  const showName = !isMine && (msgIdx === 0 ||
                      getSenderId(group.messages[msgIdx - 1]?.senderId) !== senderId);
                  const messageTime = formatMessageTime(msg?.createdAt);
                  const isRead = msg?.readBy?.length > 1 || (msg?.readBy?.length > 0 && isMine);

                  return (
                      <div
                          key={reactKey}
                          className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Avatar - hiển thị bên trái nếu không phải tin nhắn của mình */}
                        {showAvatar && (
                            <div className="flex-shrink-0 mt-1">
                              {senderInfo.avatar ? (
                                  <img
                                      src={senderInfo.avatar}
                                      alt={senderInfo.name}
                                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                  />
                              ) : (
                                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-600 font-medium text-sm">
                            {senderInfo.name.charAt(0).toUpperCase()}
                          </span>
                                  </div>
                              )}
                            </div>
                        )}

                        {/* Message Bubble with Sender Name */}
                        <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                          {/* Sender Name - hiển thị cho tin nhắn của người khác */}
                          {showName && !isMine && (
                              <span className="text-xs text-gray-500 mb-1 ml-1">
                        {senderInfo.name}
                      </span>
                          )}

                          {/* Message Bubble */}
                          <div
                              className={`
                        relative px-3 py-2 rounded-2xl break-words
                        ${isMine
                                  ? 'bg-amber-400 text-gray-900 rounded-br-none'
                                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                              }
                      `}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {msg?.content || msg?.text || ''}
                            </p>

                            {/* Time and Read Status */}
                            <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMine ? 'text-gray-700' : 'text-gray-400'}`}>
                              <span>{messageTime}</span>
                              {isMine && (
                                  <span className="flex items-center">
                            {isRead ? (
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41z"/>
                                </svg>
                            ) : (
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                            )}
                          </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Avatar bên phải cho tin nhắn của mình */}
                        {isMine && (
                            <div className="flex-shrink-0 mt-1">
                              {user?.avatar ? (
                                  <img
                                      src={user.avatar}
                                      alt={user?.fullName || 'Me'}
                                      className="w-8 h-8 rounded-full object-cover opacity-60 border border-gray-200"
                                  />
                              ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center opacity-60">
                          <span className="text-gray-500 font-medium text-sm">
                            {(user?.fullName || user?.name || 'M').charAt(0).toUpperCase()}
                          </span>
                                  </div>
                              )}
                            </div>
                        )}
                      </div>
                  );
                })}
              </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
            <button
                onClick={() => scrollToBottom('smooth')}
                className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Scroll to bottom"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m14-6l-7 7-7-7" />
              </svg>
            </button>
        )}
      </div>
  );
}