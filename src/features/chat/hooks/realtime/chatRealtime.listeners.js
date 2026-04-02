import { CHAT_EVENTS } from '@/features/chat/lib/socketClient';
import {
  onRealtimeMessageNew,
  onRealtimeMessageUpdated,
  onRealtimeMessageRead,
  onRealtimeConversationUpdated,
} from '@/features/chat/hooks/realtime/chatRealtime.handlers';

export function bindChatRealtimeListeners(socket, deps) {
  const handleMessageNew = (payload) => onRealtimeMessageNew(payload, deps);
  const handleMessageUpdated = (payload) => onRealtimeMessageUpdated(payload, deps);
  const handleMessageRead = (payload) => onRealtimeMessageRead(payload, deps);
  const handleConversationUpdated = (payload) =>
    onRealtimeConversationUpdated(payload, deps);

  socket.on(CHAT_EVENTS.MESSAGE_NEW, handleMessageNew);
  socket.on(CHAT_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
  socket.on(CHAT_EVENTS.MESSAGE_READ, handleMessageRead);
  socket.on(CHAT_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);

  return () => {
    socket.off(CHAT_EVENTS.MESSAGE_NEW, handleMessageNew);
    socket.off(CHAT_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
    socket.off(CHAT_EVENTS.MESSAGE_READ, handleMessageRead);
    socket.off(CHAT_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);
  };
}

export default bindChatRealtimeListeners;