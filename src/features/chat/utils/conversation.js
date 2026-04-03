import { getEntityId } from './id';
import { normalizeUnreadCounts } from './cache.conversations';
import { chatAPI } from '../api/chat.api';

export function isGroupConversation(conversation) {
  return String(conversation?.type || '') === 'group';
}

export function getConversationParticipants(conversation) {
  return Array.isArray(conversation?.participants) ? conversation.participants : [];
}

export function getDirectOtherParticipant(conversation, currentUserId) {
  const participants = getConversationParticipants(conversation);

  return (
    participants.find(
      (item) => String(getEntityId(item)) !== String(currentUserId)
    ) ||
    participants[0] ||
    null
  );
}

export function getConversationTitle(conversation, myId) {
  if (!conversation) return 'Cuộc trò chuyện';

  if (isGroupConversation(conversation)) {
    return (
      conversation?.groupName ||
      `Nhóm ${getConversationParticipants(conversation).length || 0} người`
    );
  }

  const other = getDirectOtherParticipant(conversation, myId);
  return other?.fullName || other?.email || 'Cuộc trò chuyện';
}

export function getConversationSubtitle(conversation) {
  if (isGroupConversation(conversation)) {
    return `${getConversationParticipants(conversation).length || 0} thành viên`;
  }

  return 'Đang hoạt động';
}

function getGroupAvatarSrc(conversation) {
  return chatAPI.getAttachmentUrl({
    url: conversation?.groupAvatar,
    filename: conversation?.groupAvatar,
  });
}

function getDirectAvatarData(conversation, myId) {
  const other = getDirectOtherParticipant(conversation, myId);
  const name = other?.fullName || other?.email || '?';

  return {
    isGroup: false,
    src: other?.avatar || '',
    label: String(name).trim().slice(0, 1).toUpperCase(),
  };
}

function getGroupAvatarData(conversation) {
  return {
    isGroup: true,
    src: getGroupAvatarSrc(conversation),
    label: (conversation?.groupName || 'G').trim().slice(0, 1).toUpperCase(),
  };
}

export function getConversationAvatarData(conversation, myId) {
  if (isGroupConversation(conversation)) {
    return getGroupAvatarData(conversation);
  }

  return getDirectAvatarData(conversation, myId);
}

export function getLastPreview(conversation) {
  const lastMsg = conversation?.lastMessage;
  const text = lastMsg?.text;

  if (text && String(text).trim()) {
    return String(text).trim();
  }

  const attachments = lastMsg?.attachments;
  if (Array.isArray(attachments) && attachments.length > 0) {
    const first = attachments[0];
    return (
      first?.originalName ||
      first?.name ||
      first?.filename ||
      first?.fileName ||
      '[Đính kèm]'
    );
  }

  if (lastMsg?.messageType === 'system') {
    return lastMsg?.text || '[Thông báo hệ thống]';
  }

  return '[Chưa có tin nhắn]';
}

export function getUnreadCount(conversation, userId) {
  if (!conversation || !userId) return 0;

  const unreadCounts = normalizeUnreadCounts(conversation?.unreadCounts);
  return Number(unreadCounts[String(userId)] || 0);
}