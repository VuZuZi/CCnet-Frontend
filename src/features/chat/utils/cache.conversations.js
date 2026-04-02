import { getEntityId } from '@/features/chat/utils/id';

export function normalizeUnreadCounts(unreadCounts) {
  if (!unreadCounts) return {};

  if (typeof unreadCounts?.entries === 'function') {
    return Object.fromEntries(unreadCounts.entries());
  }

  return { ...(unreadCounts || {}) };
}

function findConversationIndex(conversations = [], conversationId) {
  return (Array.isArray(conversations) ? conversations : []).findIndex(
    (item) => String(item?._id || '') === String(conversationId || '')
  );
}

function moveUpdatedConversationToTop(conversations, index, updatedConversation) {
  const next = [...conversations];
  next.splice(index, 1);
  return [updatedConversation, ...next];
}

export function patchConversationLastMessage(conversations = [], conversationId, message) {
  const arr = Array.isArray(conversations) ? conversations : [];
  const index = findConversationIndex(arr, conversationId);
  if (index === -1) return arr;

  const updated = {
    ...arr[index],
    lastMessage: message,
  };

  const next = [...arr];
  next[index] = updated;
  return next;
}

export function upsertConversationWithLastMessage(
  conversations = [],
  conversationId,
  message,
  options = {}
) {
  const arr = Array.isArray(conversations) ? conversations : [];
  const index = findConversationIndex(arr, conversationId);
  if (index === -1) return arr;

  const unreadCounts = normalizeUnreadCounts(arr[index]?.unreadCounts);
  const nextUnreadCounts =
    typeof options.unreadUpdater === 'function'
      ? options.unreadUpdater({ ...unreadCounts })
      : unreadCounts;

  const updated = {
    ...arr[index],
    unreadCounts: nextUnreadCounts,
    lastMessage: message,
    updatedAt: message?.createdAt || new Date().toISOString(),
  };

  return moveUpdatedConversationToTop(arr, index, updated);
}

export function applyIncomingMessageToConversationList(
  conversations = [],
  conversationId,
  message,
  { myId, activeConversationId, markMineAsRead = false } = {}
) {
  const arr = Array.isArray(conversations) ? conversations : [];
  const index = findConversationIndex(arr, conversationId);
  if (index === -1) return arr;

  const current = arr[index];
  const unreadCounts = normalizeUnreadCounts(current?.unreadCounts);
  const senderId = getEntityId(message?.senderId);
  const me = String(myId || '');
  const isMine = senderId === me;
  const isActive = String(activeConversationId || '') === String(conversationId || '');

  if (me) {
    if (isMine || (isActive && markMineAsRead)) {
      unreadCounts[me] = 0;
    } else {
      unreadCounts[me] = Number(unreadCounts[me] || 0) + 1;
    }
  }

  const updated = {
    ...current,
    unreadCounts,
    lastMessage: message,
    updatedAt: message?.createdAt || new Date().toISOString(),
  };

  return moveUpdatedConversationToTop(arr, index, updated);
}

export function patchConversationById(conversations = [], incomingConversation) {
  const arr = Array.isArray(conversations) ? conversations : [];
  const cid = String(incomingConversation?._id || incomingConversation?.conversationId || '');
  if (!cid) return arr;

  const index = findConversationIndex(arr, cid);
  if (index === -1) return arr;

  const next = [...arr];
  next[index] = {
    ...next[index],
    ...incomingConversation,
  };

  return next;
}