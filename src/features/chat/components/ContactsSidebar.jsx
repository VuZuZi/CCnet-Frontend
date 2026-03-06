import { NewConversationBox } from './NewConversationBox';
import { ConversationList } from './ConversationList';
import styles from '../styles/ChatWidget.module.css';

export function ContactsSidebar({ onOpenConversation }) {
  return (
    <aside className={styles.contactsSidebar}>
      <div className={styles.contactsHeader}>
        <div className={styles.contactsTitle}>Người liên hệ</div>
        <NewConversationBox />
      </div>

      <div className={styles.contactsBody}>
        <ConversationList onOpenConversation={onOpenConversation} />
      </div>
    </aside>
  );
}
