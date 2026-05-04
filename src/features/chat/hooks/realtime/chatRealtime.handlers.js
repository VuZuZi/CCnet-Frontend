import {
  replaceOptimisticMessage,
  upsertMessageById,
  applyReadReceiptToMessages,
} from '@/features/chat/utils/cache.messages';
import {
  applyIncomingMessageToConversationList,
  patchConversationById,
  patchConversationLastMessage,
} from '@/features/chat/utils/cache.conversations';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';
import { getEntityId } from '@/features/chat/utils/id';

function getIncomingConversationId(payload) {
  return String(
    payload?.conversationId ||
      payload?.message?.conversationId ||
      payload?.pin?.conversationId ||
      ''
  );
}

function getIncomingMessage(payload) {
  return payload?.message || null;
}

function patchMessageList(queryClient, conversationId, updater) {
  queryClient.setQueryData(chatKeys.messages(conversationId), updater);
}

function patchConversationList(queryClient, updater) {
  queryClient.setQueryData(chatKeys.conversations(), updater);
}

function patchPinnedList(queryClient, conversationId, updater) {
  queryClient.setQueryData(chatKeys.pinnedMessages(conversationId), updater);
}

function getConversationListCache(queryClient) {
  return queryClient.getQueryData(chatKeys.conversations());
}

function hasConversationInCache(queryClient, conversationId) {
  const conversations = getConversationListCache(queryClient);

  if (!Array.isArray(conversations)) return false;

  return conversations.some(
    (conversation) =>
      String(conversation?._id || conversation?.id || '') ===
      String(conversationId || '')
  );
}

function refreshConversationList(queryClient) {
  queryClient.invalidateQueries({
    queryKey: chatKeys.conversations(),
  });
}

function upsertPinnedItem(list, item) {
  const safeList = Array.isArray(list) ? list : [];
  const messageId = String(item?.messageId || item?.message?._id || '');

  const filtered = safeList.filter(
    (entry) => String(entry?.messageId || entry?.message?._id || '') !== messageId
  );

  return [item, ...filtered];
}

function removePinnedItem(list, messageId) {
  const safeList = Array.isArray(list) ? list : [];
  const targetId = String(messageId || '');

  return safeList.filter(
    (entry) => String(entry?.messageId || entry?.message?._id || '') !== targetId
  );
}

export function onRealtimeMessageNew(
  payload,
  { queryClient, myId, activeConversationId, markActiveConversationAsRead }
) {
  const incomingCid = getIncomingConversationId(payload);
  const message = getIncomingMessage(payload);

  if (!incomingCid || !message) return;

  const conversationExists = hasConversationInCache(queryClient, incomingCid);

  patchConversationList(queryClient, (oldData) =>
    applyIncomingMessageToConversationList(oldData, incomingCid, message, {
      myId,
      activeConversationId,
      markMineAsRead: markActiveConversationAsRead,
    })
  );

  if (!conversationExists) {
    refreshConversationList(queryClient);
  }

  patchMessageList(queryClient, incomingCid, (oldData) =>
    replaceOptimisticMessage(oldData, message)
  );
}

export function onRealtimeMessageUpdated(payload, { queryClient }) {
  const incomingCid = getIncomingConversationId(payload);
  const message = getIncomingMessage(payload);

  if (!incomingCid || !message) return;

  patchMessageList(queryClient, incomingCid, (oldData) =>
    upsertMessageById(oldData, message)
  );

  patchConversationList(queryClient, (oldData) =>
    patchConversationLastMessage(oldData, incomingCid, message)
  );

  if (!hasConversationInCache(queryClient, incomingCid)) {
    refreshConversationList(queryClient);
  }
}

export function onRealtimeMessageRead(payload, { queryClient, myId }) {
  const incomingCid = String(payload?.conversationId || '');
  const messageId = String(payload?.messageId || payload?.lastReadMessageId || '');
  const reader = payload?.reader;

  if (!incomingCid || !reader) return;

  const readerId = getEntityId(reader);
  if (!readerId || readerId === String(myId)) return;

  patchMessageList(queryClient, incomingCid, (oldData) =>
    applyReadReceiptToMessages(oldData, messageId, reader)
  );
}

export function onRealtimeConversationUpdated(payload, { queryClient }) {
  const conversation = payload?.conversation;
  const incomingCid = String(payload?.conversationId || conversation?._id || '');

  if (!incomingCid || !conversation) return;

  patchConversationList(queryClient, (oldData) =>
    patchConversationById(oldData, conversation)
  );

  if (!hasConversationInCache(queryClient, incomingCid)) {
    refreshConversationList(queryClient);
  }
}

export function onRealtimeMessagePinned(payload, { queryClient }) {
  const incomingCid = String(payload?.conversationId || payload?.pin?.conversationId || '');
  const pin = payload?.pin;

  if (!incomingCid || !pin) return;

  patchPinnedList(queryClient, incomingCid, (oldData) =>
    upsertPinnedItem(oldData, pin)
  );
}

export function onRealtimeMessageUnpinned(payload, { queryClient }) {
  const incomingCid = String(payload?.conversationId || '');
  const messageId = String(payload?.messageId || '');

  if (!incomingCid || !messageId) return;

  patchPinnedList(queryClient, incomingCid, (oldData) =>
    removePinnedItem(oldData, messageId)
  );
}