import { io } from 'socket.io-client';
import { env } from '@/config/env';
import { tokenManager } from '@/shared/lib/tokenManager';
import { CHAT_EVENTS } from '../constants/chat.constants';

let socket = null;

export { CHAT_EVENTS };

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
  const instance = getChatSocket();

  instance.auth = {
    token: tokenManager.getAccessToken(),
  };

  if (!instance.connected) {
    instance.connect();
  }

  return instance;
}

export function disconnectChatSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}