import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ContactsSidebar } from './ContactsSidebar';
import { ChatPanel } from './ChatPanel';
import { useChatStore, chatSelectors } from '../stores/useChatStore';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { connectChatSocket, disconnectChatSocket, CHAT_EVENTS } from '../lib/socketClient';

export default function ChatWidget({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);
  const user = useAuthStore(authSelectors.user);

 
  const myId = user?._id || user?.id || user?.userId;

  const openConversationIds = useChatStore(chatSelectors.openConversationIds) || [];
  const focusedConversationId = useChatStore(chatSelectors.focusedConversationId);

  const openConversation = useChatStore((s) => s.openConversation);
  const closeConversation = useChatStore((s) => s.closeConversation);
  const clearChat = useChatStore((s) => s.clearChat);

  const openIdsRef = useRef(openConversationIds);
  const focusedIdRef = useRef(focusedConversationId || null);
  const myIdRef = useRef(myId || null);

  useEffect(() => {
    openIdsRef.current = openConversationIds;
  }, [openConversationIds]);

  useEffect(() => {
    focusedIdRef.current = focusedConversationId || null;
  }, [focusedConversationId]);

  useEffect(() => {
    myIdRef.current = myId || null;
  }, [myId]);

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    }

    if (!isAuthLoading && !isAuthenticated) {
      clearChat();
      queryClient.removeQueries({ queryKey: ['chat'] });
      disconnectChatSocket();
    }
  }, [isAuthenticated, isAuthLoading, clearChat, queryClient]);

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return undefined;

    const socket = connectChatSocket();

    const joinUserRoom = () => {
      const uid = myIdRef.current;
      if (!uid) return;
      socket.emit('user:join', String(uid), () => {});
    };

    const onConnect = () => joinUserRoom();

    const onRealtime = (payload) => {
      const conversationId = payload?.conversationId;
      const message = payload?.message;
      if (!conversationId || !message) return;

      const cid = String(conversationId);
      const senderId =
        message?.senderId?._id ||
        message?.senderId?.userId ||
        message?.senderId?.id ||
        message?.senderId;

      const me = myIdRef.current;
      const isMyMessage = me && senderId && String(senderId) === String(me);

      queryClient.setQueryData(['chat', 'conversations'], (oldData) => {
        const arr = Array.isArray(oldData) ? oldData : [];
        const idx = arr.findIndex((c) => String(c?._id) === cid);

        if (idx === -1) return arr;

        const current = arr[idx];
        const uc = current?.unreadCounts || {};
        const ucObj =
          typeof uc?.get === 'function'
            ? Object.fromEntries(Array.from(uc.entries()))
            : { ...uc };

        let nextUnreadCounts = { ...ucObj };

        if (me) {
          if (isMyMessage) {
            nextUnreadCounts[String(me)] = 0;
          } else {
            const isOpened = openIdsRef.current.some((x) => String(x) === cid);
            const isFocused = String(focusedIdRef.current || '') === cid;
            const shouldCountUnread = !(isOpened || isFocused);

            nextUnreadCounts[String(me)] = shouldCountUnread
              ? (ucObj[String(me)] || 0) + 1
              : 0;
          }
        }

        const updated = {
          ...current,
          lastMessage: message,
          updatedAt: message?.createdAt || current.updatedAt,
          unreadCounts: nextUnreadCounts,
        };

        return [updated, ...arr.filter((_, i) => i !== idx)];
      });

      queryClient.setQueryData(['chat', 'messages', cid], (oldData) => {
        const arr = Array.isArray(oldData) ? oldData : null;
        if (!arr) return oldData;
        if (arr.some((m) => String(m?._id) === String(message?._id))) return arr;
        return [...arr, message];
      });
    };

    socket.on('connect', onConnect);
    socket.on(CHAT_EVENTS.MESSAGE_NEW, onRealtime);
    socket.on(CHAT_EVENTS.NOTIFY, onRealtime);

    if (socket.connected) joinUserRoom();

    return () => {
      socket.off('connect', onConnect);
      socket.off(CHAT_EVENTS.MESSAGE_NEW, onRealtime);
      socket.off(CHAT_EVENTS.NOTIFY, onRealtime);
    };
  }, [isAuthenticated, isAuthLoading, queryClient]);

  if (isAuthLoading || !isAuthenticated) return null;

  return (
    <>
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-[1100] w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
          <ContactsSidebar
            onOpenConversation={openConversation}
            onConversationSelected={onClose}
          />
        </div>
      )}

      {createPortal(
        <>
          {openConversationIds.map((id, index) => (
            <ChatPanel
              key={id}
              index={index}
              conversationId={id}
              onClose={() => closeConversation(id)}
            />
          ))}
        </>,
        document.body
      )}
    </>
  );
}