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
  return String(payload?.conversationId || payload?.message?.conversationId || '');
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

export function onRealtimeMessageNew(
  payload,
  { queryClient, myId, activeConversationId, markActiveConversationAsRead }
) {
  const incomingCid = getIncomingConversationId(payload);
  const message = getIncomingMessage(payload);

  if (!incomingCid || !message) return;

  patchConversationList(queryClient, (oldData) =>
    applyIncomingMessageToConversationList(oldData, incomingCid, message, {
      myId,
      activeConversationId,
      markMineAsRead: markActiveConversationAsRead,
    })
  );

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
}