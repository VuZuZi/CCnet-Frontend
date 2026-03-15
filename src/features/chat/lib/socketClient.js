import { io } from 'socket.io-client';
import { env } from '@/config/env';
import { tokenManager } from '@/shared/lib/tokenManager';

let socket = null;

export const CHAT_EVENTS = {
  MESSAGE_NEW: 'chat:message:new',
  NOTIFY: 'chat:notify',
  USER_JOIN: 'user:join',
  JOIN: 'join',
  LEAVE: 'leave',
};

export function getChatSocket() {
  if (socket) return socket;

  socket = io(env.SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
    auth: {
      token: tokenManager.getAccessToken(),
    },
  });

  socket.on('connect', () => {
    console.log('[chat socket] connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[chat socket] disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[chat socket] connect_error:', error?.message || error);
  });

  socket.io.on('reconnect_attempt', () => {
    if (!socket) return;
    socket.auth = {
      token: tokenManager.getAccessToken(),
    };
  });

  return socket;
}

export function connectChatSocket() {
  const s = getChatSocket();

  s.auth = {
    token: tokenManager.getAccessToken(),
  };

  if (!s.connected) {
    s.connect();
  }

  return s;
}

export function disconnectChatSocket() {
  if (!socket) return;

  socket.disconnect();
  socket = null;
}