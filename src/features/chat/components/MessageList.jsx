import { Spinner } from 'react-bootstrap';
import { useEffect, useMemo, useRef } from 'react';

import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useMessages } from '../hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import styles from '../styles/ChatWidget.module.css';

export function MessageList({ conversationId, scrollSignal }) {
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { messages, isLoading } = useMessages(conversationId);

  const listRef = useRef(null);
  const endRef = useRef(null);

  const safeMessages = useMemo(() => messages || [], [messages]);

  const scrollToBottom = (smooth = true) => {
    endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
  };

  const isNearBottom = () => {
    const el = listRef.current;
    if (!el) return true;
    const threshold = 120;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  useEffect(() => {
    if (!conversationId) return undefined;
    const t = setTimeout(() => scrollToBottom(false), 0);
    return () => clearTimeout(t);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || isLoading) return undefined;
    const t = setTimeout(() => scrollToBottom(false), 0);
    return () => clearTimeout(t);
  }, [conversationId, isLoading]);

  useEffect(() => {
    if (!conversationId) return;
    if (isNearBottom()) scrollToBottom(false);
  }, [conversationId, safeMessages.length]);

  useEffect(() => {
    if (!conversationId) return;
    if (scrollSignal) scrollToBottom(true);
  }, [conversationId, scrollSignal]);

  if (!conversationId) {
    return (
      <div className={styles.messagesEmpty}>
        <div>
          <div className={styles.messagesEmptyTitle}>Chọn một liên hệ</div>
          <div className={styles.messagesEmptySub}>Bấm vào người bên phải để mở hộp chat.</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.messagesLoading}>
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <div ref={listRef} className={styles.messages}>
      {safeMessages.map((m) => {
        const senderId = m?.senderId?._id || m?.senderId?.userId || m?.senderId;
        const isMine = String(senderId) === String(myId);
        return <MessageBubble key={m._id} message={m} isMine={isMine} />;
      })}
      <div ref={endRef} />
    </div>
  );
}
