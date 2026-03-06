import { io } from 'socket.io-client';
import { env } from '@/config/env';
import { tokenManager } from '@/shared/lib/tokenManager';

let socket = null;

export const CHAT_EVENTS = {
  MESSAGE_NEW: 'chat:message:new',
  NOTIFY: 'chat:notify',
};

export function getChatSocket() {
  if (socket) return socket;

  socket = io(env.SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket'],
    auth: { token: tokenManager.getAccessToken() },

    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
  });

  socket.on('reconnect_attempt', () => {
    socket.auth = { token: tokenManager.getAccessToken() };
  });

  return socket;
}

export function connectChatSocket() {
  const s = getChatSocket();
  s.auth = { token: tokenManager.getAccessToken() };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectChatSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
