import { getEntityId } from './id';

export function getSenderId(sender) {
  return getEntityId(sender);
}

export function getSenderName(sender) {
  return (
    sender?.fullName ||
    sender?.username ||
    sender?.email ||
    sender?.name ||
    'Người dùng'
  );
}

export function isSystemMessage(message) {
  return String(message?.messageType || '') === 'system';
}

export function isImageAttachment(attachment) {
  return String(attachment?.mimetype || '').startsWith('image/');
}

export function pickFilename(attachment) {
  return (
    attachment?.originalName ||
    attachment?.filename ||
    attachment?.name ||
    'Tệp đính kèm'
  );
}

export function groupReactions(reactions = []) {
  const map = new Map();

  for (const item of reactions || []) {
    const emoji = String(item?.emoji || '').trim();
    if (!emoji) continue;

    if (!map.has(emoji)) {
      map.set(emoji, {
        emoji,
        count: 0,
        users: [],
      });
    }

    const current = map.get(emoji);
    current.count += 1;
    current.users.push(item?.userId);
  }

  return Array.from(map.values());
}

export function hasMyReaction(reactions = [], emoji, currentUserId) {
  return (reactions || []).some(
    (item) =>
      String(item?.emoji || '') === String(emoji) &&
      String(getEntityId(item?.userId)) === String(currentUserId)
  );
}

export function getReplyPreviewText(replyTo) {
  if (!replyTo) return '';

  if (replyTo?.isUnsent) return 'Tin nhắn đã bị thu hồi';
  if (replyTo?.text) return replyTo.text;

  const attachments = Array.isArray(replyTo?.attachments) ? replyTo.attachments : [];
  if (attachments.length > 0) return '[Tệp đính kèm]';

  return '';
}

export function formatMessageTime(value) {
  if (!value) return '';

  try {
    return new Date(value).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}