import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ContactsSidebar } from './ContactsSidebar';
import { ChatPanel } from './ChatPanel';
import { useChatStore, chatSelectors } from '../stores/useChatStore';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { connectChatSocket, disconnectChatSocket, CHAT_EVENTS } from '../lib/socketClient';

export default function ChatWidget() {
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isAuthLoading = useAuthStore(authSelectors.isLoading);
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const openConversationIds = useChatStore(chatSelectors.openConversationIds);
  const focusedConversationId = useChatStore(chatSelectors.focusedConversationId);

  const openConversation = useChatStore((s) => s.openConversation);
  const closeConversation = useChatStore((s) => s.closeConversation);
  const clearChat = useChatStore((s) => s.clearChat);

  const openIdsRef = useRef(openConversationIds || []);
  const focusedIdRef = useRef(focusedConversationId || null);
  const myIdRef = useRef(myId || null);

  useEffect(() => {
    openIdsRef.current = openConversationIds || [];
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
  }, [isAuthenticated, isAuthLoading, queryClient]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      clearChat();
      queryClient.removeQueries({ queryKey: ['chat'] });
      disconnectChatSocket();
    }
  }, [isAuthenticated, isAuthLoading, clearChat, queryClient]);

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return undefined;

    const s = connectChatSocket();

    const joinUserRoom = () => {
      const uid = myIdRef.current;
      if (!uid) return;
      s.emit('user:join', String(uid), () => {});
    };

    const onConnect = () => {
      joinUserRoom();
    };

    const onConnectError = () => {};

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
      if (me && senderId && String(senderId) === String(me)) return;

      const isOpened = (openIdsRef.current || []).some((x) => String(x) === cid);
      const isFocused = String(focusedIdRef.current || '') === cid;
      const shouldCountUnread = !(isOpened || isFocused);

      queryClient.setQueryData(['chat', 'conversations'], (old = []) => {
        const arr = Array.isArray(old) ? old : [];
        const idx = arr.findIndex((c) => String(c?._id) === cid);
        if (idx === -1) return arr;

        const current = arr[idx];
        const uc = current?.unreadCounts || {};
        const ucObj = typeof uc?.get === 'function'
          ? Object.fromEntries(Array.from(uc.entries()))
          : { ...(uc || {}) };

        const nextUnreadCounts =
          me && shouldCountUnread
            ? { ...ucObj, [String(me)]: (ucObj[String(me)] || 0) + 1 }
            : me
              ? { ...ucObj, [String(me)]: 0 }
              : ucObj;

        const updated = {
          ...current,
          lastMessage: message,
          updatedAt: message?.createdAt || current.updatedAt,
          unreadCounts: nextUnreadCounts,
        };

        return [updated, ...arr.filter((_, i) => i !== idx)];
      });

      queryClient.setQueryData(['chat', 'messages', cid], (old) => {
        const arr = Array.isArray(old) ? old : null;
        if (!arr) return old;
        if (arr.some((m) => String(m?._id) === String(message?._id))) return arr;
        return [...arr, message];
      });
    };

    s.on('connect', onConnect);
    s.on('connect_error', onConnectError);
    s.on(CHAT_EVENTS.MESSAGE_NEW, onRealtime);
    s.on(CHAT_EVENTS.NOTIFY, onRealtime);

    if (s.connected) joinUserRoom();

    return () => {
      s.off('connect', onConnect);
      s.off('connect_error', onConnectError);
      s.off(CHAT_EVENTS.MESSAGE_NEW, onRealtime);
      s.off(CHAT_EVENTS.NOTIFY, onRealtime);
    };
  }, [isAuthenticated, isAuthLoading, queryClient]);

  if (isAuthLoading) return null;
  if (!isAuthenticated) return null;

  const content = (
    <>
      <ContactsSidebar onOpenConversation={openConversation} />
      {openConversationIds.map((id, idx) => (
        <ChatPanel
          key={id}
          data-index={idx}
          conversationId={id}
          onClose={() => closeConversation(id)}
        />
      ))}
    </>
  );

  return createPortal(content, document.body);
}
