import { CHAT_EVENTS } from '@/features/chat/lib/socketClient';
import {
  onRealtimeMessageNew,
  onRealtimeMessageUpdated,
  onRealtimeMessageRead,
  onRealtimeConversationUpdated,
  onRealtimeMessagePinned,
  onRealtimeMessageUnpinned,
} from '@/features/chat/hooks/realtime/chatRealtime.handlers';

export function bindChatRealtimeListeners(socket, deps) {
  const handleMessageNew = (payload) => onRealtimeMessageNew(payload, deps);
  const handleMessageUpdated = (payload) => onRealtimeMessageUpdated(payload, deps);
  const handleMessageRead = (payload) => onRealtimeMessageRead(payload, deps);
  const handleConversationUpdated = (payload) =>
    onRealtimeConversationUpdated(payload, deps);
  const handleMessagePinned = (payload) => onRealtimeMessagePinned(payload, deps);
  const handleMessageUnpinned = (payload) => onRealtimeMessageUnpinned(payload, deps);

  socket.on(CHAT_EVENTS.MESSAGE_NEW, handleMessageNew);
  socket.on(CHAT_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
  socket.on(CHAT_EVENTS.MESSAGE_READ, handleMessageRead);
  socket.on(CHAT_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);
  socket.on(CHAT_EVENTS.MESSAGE_PINNED, handleMessagePinned);
  socket.on(CHAT_EVENTS.MESSAGE_UNPINNED, handleMessageUnpinned);

  return () => {
    socket.off(CHAT_EVENTS.MESSAGE_NEW, handleMessageNew);
    socket.off(CHAT_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
    socket.off(CHAT_EVENTS.MESSAGE_READ, handleMessageRead);
    socket.off(CHAT_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);
    socket.off(CHAT_EVENTS.MESSAGE_PINNED, handleMessagePinned);
    socket.off(CHAT_EVENTS.MESSAGE_UNPINNED, handleMessageUnpinned);
  };
}

export default bindChatRealtimeListeners;