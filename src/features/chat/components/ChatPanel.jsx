import { Card } from 'react-bootstrap';
import { useState } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';
import { useConversations } from '../hooks/useConversations';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useChatStore } from '../stores/useChatStore';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import styles from '../styles/ChatWidget.module.css';

export function ChatPanel({ onClose, conversationId, className = '', ...props }) {
  useChatSocket(conversationId);

  const focusConversation = useChatStore((s) => s.focusConversation);
  const [scrollSignal, setScrollSignal] = useState(0);

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { conversations } = useConversations();

  const active = (conversations || []).find((c) => String(c?._id) === String(conversationId));
  const participants = active?.participants || [];
  const other =
    participants.find((p) => String(p?._id) !== String(myId)) || participants[0] || null;

  const headerTitle = other?.fullName || other?.email || 'Chat';

  return (
    <Card
      {...props}
      className={`${styles.panel} shadow-sm border-0 ${className}`}
      onMouseDown={() => focusConversation(conversationId)}
    >
      <Card.Body className={`${styles.panelBody} p-0 d-flex flex-column`}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderLeft}>
            <div className={styles.panelAvatar}>
              {(headerTitle || '?').trim().slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className={styles.panelTitle}>{headerTitle}</div>
              <div className={styles.smallMuted}>Đang hoạt động</div>
            </div>
          </div>

          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.panelChatArea}>
          <MessageList conversationId={conversationId} scrollSignal={scrollSignal} />
          <MessageComposer
            conversationId={conversationId}
            onSent={() => setScrollSignal((x) => x + 1)}
          />
        </div>
      </Card.Body>
    </Card>
  );
}
