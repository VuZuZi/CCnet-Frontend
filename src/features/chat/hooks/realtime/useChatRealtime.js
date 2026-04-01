import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { connectChatSocket, CHAT_EVENTS } from '@/features/chat/lib/socketClient';
import { bindChatRealtimeListeners } from '@/features/chat/hooks/realtime/chatRealtime.listeners';

function emitJoinUserRoom(socket, userId) {
  if (!userId) return;

  socket.emit(CHAT_EVENTS.USER_JOIN, String(userId), (ack) => {
    console.log('[chat realtime] user join ack:', ack);
  });
}

function emitJoinConversationRoom(socket, conversationId) {
  const cid = String(conversationId || '');
  if (!cid) return;

  socket.emit(CHAT_EVENTS.JOIN, cid, (ack) => {
    console.log('[chat realtime] join conversation ack:', ack);
  });
}

function emitLeaveConversationRoom(socket, conversationId) {
  const cid = String(conversationId || '');
  if (!cid) return;

  socket.emit(CHAT_EVENTS.LEAVE, cid);
}

export function useChatRealtime({
  activeConversationId = '',
  markActiveConversationAsRead = false,
  enabled = true,
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id || '';
  const safeActiveConversationId = String(activeConversationId || '');

  useEffect(() => {
    if (!enabled || !myId) return undefined;

    const socket = connectChatSocket();

    emitJoinUserRoom(socket, myId);
    emitJoinConversationRoom(socket, safeActiveConversationId);

    const cleanupListeners = bindChatRealtimeListeners(socket, {
      queryClient,
      myId,
      activeConversationId: safeActiveConversationId,
      markActiveConversationAsRead,
    });

    return () => {
      emitLeaveConversationRoom(socket, safeActiveConversationId);
      cleanupListeners();
    };
  }, [
    enabled,
    myId,
    queryClient,
    safeActiveConversationId,
    markActiveConversationAsRead,
  ]);
}

export default useChatRealtime;