import { useEffect } from 'react';
import { connectChatSocket } from '../lib/socketClient';

export function useChatSocket(conversationId) {
  useEffect(() => {
    const s = connectChatSocket();
    if (!conversationId) return undefined;

    const room = String(conversationId);

    s.emit('join', room, () => {});

    return () => {
      s.emit('leave', room);
    };
  }, [conversationId]);
}
