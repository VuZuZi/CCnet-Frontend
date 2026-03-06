import { Alert, Spinner } from 'react-bootstrap';
import { useConversations } from '../hooks/useConversations';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useChatStore, chatSelectors } from '../stores/useChatStore';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import styles from '../styles/ChatWidget.module.css';

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
    return a?.originalName || a?.name || a?.filename || a?.fileName || '[Attachment]';
  }

  return '[No messages]';
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
      <div className={styles.centerBox}>
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.pad12}>
        <Alert variant="danger" className="mb-0">
          {errorMessage || 'Failed to load conversations'}
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.conversationList}>
      {(conversations || []).map((c) => {
        const id = String(c?._id || '').trim();
        const participants = c?.participants || [];
        const other =
          participants.find((p) => String(p?._id) !== String(myId)) || participants[0] || {};

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

        return (
          <button
            key={id}
            type="button"
            className={styles.conversationItem}
            onClick={handleClick}
          >
            <div
              className={`${styles.conversationRow} ${
                isFocused ? styles.activeRow : isOpened ? styles.openedRow : ''
              }`}
            >
              <div className={styles.conversationLeft}>
                <div className={styles.avatarCircle}>{avatarLetter}</div>

                <div className={styles.nameAndLast}>
                  <div className={styles.nameText}>{name}</div>
                  <div className={styles.lastText}>{lastText}</div>
                </div>
              </div>

              {unread > 0 && <span className={styles.unreadBadge}>{unread}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ConversationList;
