import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useCreateConversation } from '../hooks/useCreateConversation';
import styles from '../styles/ChatWidget.module.css';

export function NewConversationBox() {
  const [participantId, setParticipantId] = useState('');
  const { createConversation, isLoading } = useCreateConversation();

  const handleStart = () => {
    const id = participantId.trim();
    if (!id) return;

    createConversation({ participantId: id });
    setParticipantId('');
  };

  return (
    <div className={styles.newConversationRow}>
      <Form.Control
        placeholder="Enter participantId..."
        value={participantId}
        onChange={(e) => setParticipantId(e.target.value)}
        disabled={isLoading}
      />
      <Button
        type="button"
        onClick={handleStart}
        disabled={isLoading}
        className={styles.startBtn}
      >
        Start
      </Button>
    </div>
  );
}

export default NewConversationBox;
