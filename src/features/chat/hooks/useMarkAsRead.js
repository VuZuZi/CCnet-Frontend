import { useState } from 'react';
import { chatAPI } from '../api/chatAPI';

export function useMarkAsRead() {
  const [isMarking, setIsMarking] = useState(false);

  const markAsRead = async (conversationId) => {
    const cid = String(conversationId || '');
    if (!cid || cid.length !== 24) return;

    try {
      setIsMarking(true);
      await chatAPI.markAsRead(cid);
    } finally {
      setIsMarking(false);
    }
  };

  return { markAsRead, isMarking };
}
