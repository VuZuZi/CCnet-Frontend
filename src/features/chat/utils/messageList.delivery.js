import { getSenderId } from './messageList';

export function getDeliveryStatus(message) {
  return message?.status || 'sent';
}

export function shouldShowDeliveryStatus(messages = [], index, currentUserId) {
  const current = messages[index];
  if (!current) return false;

  const myId = String(currentUserId || '');
  const currentSenderId = String(getSenderId(current?.senderId) || '');

  if (!myId || currentSenderId !== myId) {
    return false;
  }

  // Chỉ hiện status cho tin nhắn mới nhất của mình trong toàn bộ danh sách.
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const item = messages[i];
    const senderId = String(getSenderId(item?.senderId) || '');

    if (!senderId) continue;
    if (String(item?.messageType || '') === 'system') continue;

    return senderId === myId && i === index;
  }

  return false;
}