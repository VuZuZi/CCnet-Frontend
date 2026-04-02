import { getEntityId } from '@/features/chat/utils/id';

function resolveMessageStatus(message, fallbackStatus = 'sent') {
  return message?.status || fallbackStatus;
}

function normalizeIncomingMessage(incomingMessage) {
  return {
    ...incomingMessage,
    status: resolveMessageStatus(incomingMessage, 'sent'),
    __optimistic: false,
  };
}

function findMessageIndexById(messages = [], messageId) {
  return (Array.isArray(messages) ? messages : []).findIndex(
    (item) => String(item?._id || '') === String(messageId || '')
  );
}

function mergeMessageAtIndex(messages, index, incomingMessage) {
  const next = [...messages];
  next[index] = {
    ...next[index],
    ...normalizeIncomingMessage(incomingMessage),
  };
  return next;
}

export function replaceMessageById(messages = [], incomingMessage) {
  const arr = Array.isArray(messages) ? messages : [];
  const realId = String(incomingMessage?._id || '');
  if (!realId) return arr;

  const index = findMessageIndexById(arr, realId);
  if (index === -1) return arr;

  return mergeMessageAtIndex(arr, index, incomingMessage);
}

export function upsertMessageById(messages = [], incomingMessage) {
  const arr = Array.isArray(messages) ? messages : [];
  const realId = String(incomingMessage?._id || '');
  if (!realId) return arr;

  const index = findMessageIndexById(arr, realId);
  if (index !== -1) {
    return mergeMessageAtIndex(arr, index, incomingMessage);
  }

  return [...arr, normalizeIncomingMessage(incomingMessage)];
}

export function replaceOptimisticMessage(messages = [], incomingMessage) {
  const arr = Array.isArray(messages) ? messages : [];
  const realId = String(incomingMessage?._id || '');
  if (!realId) return arr;

  const normalizedIncomingMessage = normalizeIncomingMessage(incomingMessage);

  const exactIndex = findMessageIndexById(arr, realId);
  if (exactIndex !== -1) {
    const next = [...arr];
    next[exactIndex] = normalizedIncomingMessage;
    return next;
  }

  const incomingSenderId = getEntityId(incomingMessage?.senderId);
  const incomingText = String(incomingMessage?.text || '').trim();
  const incomingCreatedAt = incomingMessage?.createdAt
    ? new Date(incomingMessage.createdAt).getTime()
    : 0;

  const optimisticIndex = arr.findIndex((item) => {
    if (!item?.__optimistic) return false;

    const sameSender = getEntityId(item?.senderId) === incomingSenderId;
    const sameText = String(item?.text || '').trim() === incomingText;

    const tempCreatedAt = item?.createdAt ? new Date(item.createdAt).getTime() : 0;
    const closeTime =
      incomingCreatedAt && tempCreatedAt
        ? Math.abs(incomingCreatedAt - tempCreatedAt) < 15000
        : true;

    return sameSender && sameText && closeTime;
  });

  if (optimisticIndex !== -1) {
    const next = [...arr];
    next[optimisticIndex] = normalizedIncomingMessage;
    return next;
  }

  return [...arr, normalizedIncomingMessage];
}

export function appendMessage(messages = [], incomingMessage) {
  const arr = Array.isArray(messages) ? messages : [];
  return [...arr, incomingMessage];
}

export const prependMessage = appendMessage;

export function removeMessageById(messages = [], messageId) {
  return (Array.isArray(messages) ? messages : []).filter(
    (item) => String(item?._id || '') !== String(messageId || '')
  );
}

export function applyReadReceiptToMessages(messages = [], messageId, reader) {
  const arr = Array.isArray(messages) ? messages : [];
  const readerId = getEntityId(reader);
  if (!readerId) return arr;

  const anchorMessage = arr.find(
    (item) => String(item?._id || '') === String(messageId || '')
  );
  const anchorTime = anchorMessage
    ? new Date(anchorMessage.createdAt || 0).getTime()
    : null;

  return arr.map((message) => {
    const senderId = getEntityId(message?.senderId);
    if (!senderId || senderId === readerId || message?.isUnsent) {
      return message;
    }

    const messageTime = new Date(message?.createdAt || 0).getTime();
    const shouldApply = anchorTime == null ? true : messageTime <= anchorTime;

    if (!shouldApply) return message;

    const seenBy = Array.isArray(message?.seenBy) ? [...message.seenBy] : [];
    const alreadySeen = seenBy.some(
      (item) => getEntityId(item?.userId || item) === readerId
    );

    if (alreadySeen) {
      return {
        ...message,
        status: 'seen',
      };
    }

    return {
      ...message,
      status: 'seen',
      seenBy: [
        ...seenBy,
        {
          userId: reader,
          seenAt: new Date().toISOString(),
        },
      ],
    };
  });
}