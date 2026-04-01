import { getSenderId, getUserId, normalizeUser } from './messageList';

export function getSeenUsers(message, myId, participantMap = new Map()) {
  const rawSeen = [
    ...(Array.isArray(message?.seenByUsers) ? message.seenByUsers : []),
    ...(Array.isArray(message?.seenBy) ? message.seenBy : []),
    ...(Array.isArray(message?.readByUsers) ? message.readByUsers : []),
    ...(Array.isArray(message?.readBy) ? message.readBy : []),
  ].filter(Boolean);

  const dedupeMap = new Map();

  rawSeen.forEach((item) => {
    const normalized = normalizeUser(item, participantMap);
    const normalizedId = getUserId(normalized);

    if (!normalizedId) return;
    if (String(normalizedId) === String(myId || '')) return;

    if (!dedupeMap.has(String(normalizedId))) {
      dedupeMap.set(String(normalizedId), normalized);
    }
  });

  return Array.from(dedupeMap.values());
}

export function getSeenAnchorMessageId(messages = [], myId) {
  if (!Array.isArray(messages) || messages.length === 0) return '';

  const safeMessages = messages.filter((message) => {
    return String(message?.messageType || '') !== 'system';
  });

  if (!safeMessages.length) return '';

  for (let i = safeMessages.length - 1; i >= 0; i -= 1) {
    const message = safeMessages[i];
    const senderId = getSenderId(message?.senderId);

    if (!senderId) continue;

    if (String(senderId) !== String(myId || '')) {
      return '';
    }

    const hasSeenUsers =
      (Array.isArray(message?.seenBy) && message.seenBy.length > 0) ||
      (Array.isArray(message?.seenByUsers) && message.seenByUsers.length > 0) ||
      (Array.isArray(message?.readBy) && message.readBy.length > 0) ||
      (Array.isArray(message?.readByUsers) && message.readByUsers.length > 0);

    if (hasSeenUsers) {
      return String(message?._id || '');
    }
  }

  return '';
}