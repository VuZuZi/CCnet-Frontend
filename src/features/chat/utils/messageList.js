import { getEntityId } from './id';
import { getSeenAnchorMessageId, getSeenUsers } from './messageList.seen';
import { getDeliveryStatus } from './messageList.delivery';

export function getUserId(user) {
  return getEntityId(user);
}

export function getSenderId(sender) {
  return getEntityId(sender);
}

export function normalizeUser(userLike, participantMap = new Map()) {
  if (!userLike) return null;

  if (typeof userLike === 'string') {
    const participant = participantMap.get(String(userLike));
    if (!participant) return null;

    return {
      ...participant,
      _id: String(participant?._id || userLike),
      id: String(participant?._id || userLike),
      userId: String(participant?._id || userLike),
    };
  }

  const nestedUser =
    (userLike?.userId && typeof userLike.userId === 'object' && userLike.userId) ||
    (userLike?.readerId && typeof userLike.readerId === 'object' && userLike.readerId) ||
    (userLike?.user && typeof userLike.user === 'object' && userLike.user) ||
    (userLike?.reader && typeof userLike.reader === 'object' && userLike.reader) ||
    null;

  const realUserId = getUserId(userLike);
  const participantUser = participantMap.get(String(realUserId || ''));
  const baseUser = nestedUser || participantUser || userLike;

  if (!realUserId) return null;

  return {
    ...(participantUser || {}),
    ...(nestedUser || {}),
    ...(typeof userLike === 'object' ? userLike : {}),
    ...baseUser,
    _id: String(realUserId),
    id: String(realUserId),
    userId: String(realUserId),
    fullName:
      baseUser?.fullName ||
      participantUser?.fullName ||
      nestedUser?.fullName ||
      userLike?.fullName ||
      userLike?.name ||
      '',
    avatar:
      baseUser?.avatar ||
      participantUser?.avatar ||
      nestedUser?.avatar ||
      userLike?.avatar ||
      userLike?.photoURL ||
      '',
  };
}

export function dedupeMessages(messages = []) {
  const map = new Map();

  for (const msg of messages) {
    const realId = String(msg?._id || '');

    if (realId) {
      map.set(realId, msg);
      continue;
    }

    const fallbackKey = [
      getSenderId(msg?.senderId),
      String(msg?.createdAt || ''),
      String(msg?.text || ''),
    ].join('__');

    map.set(fallbackKey, msg);
  }

  return Array.from(map.values());
}

export function sortMessagesByCreatedAt(messages = []) {
  return [...messages].sort((a, b) => {
    const ta = new Date(a?.createdAt || 0).getTime();
    const tb = new Date(b?.createdAt || 0).getTime();
    return ta - tb;
  });
}

export function formatSeparatorLabel(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isMoreThan15MinutesApart(prevDateLike, currentDateLike) {
  if (!prevDateLike || !currentDateLike) return false;

  const prev = new Date(prevDateLike).getTime();
  const current = new Date(currentDateLike).getTime();

  if (Number.isNaN(prev) || Number.isNaN(current)) return false;

  return current - prev >= 15 * 60 * 1000;
}

export function enrichMessageGroups(messages = [], myId, participantMap = new Map()) {
  const seenAnchorMessageId = getSeenAnchorMessageId(messages, myId);

  return messages.map((message, index, arr) => {
    const prev = arr[index - 1];
    const next = arr[index + 1];

    const currentSenderId = getSenderId(message?.senderId);
    const prevSenderId = getSenderId(prev?.senderId);
    const nextSenderId = getSenderId(next?.senderId);

    const isSystem = String(message?.messageType || '') === 'system';
    const isIncoming = currentSenderId && currentSenderId !== String(myId || '');
    const messageId = String(message?._id || '');

    const prevGapBreak = isMoreThan15MinutesApart(prev?.createdAt, message?.createdAt);
    const nextGapBreak = isMoreThan15MinutesApart(message?.createdAt, next?.createdAt);

    const showSenderName =
      !isSystem &&
      isIncoming &&
      (!prev || currentSenderId !== prevSenderId || prevGapBreak);

    const showSenderAvatar =
      !isSystem &&
      isIncoming &&
      (!next || currentSenderId !== nextSenderId || nextGapBreak);

    const showTimeSeparator = index > 0 && prevGapBreak;
    const seenUsers = getSeenUsers(message, myId, participantMap);

    const showSeenAvatars = Boolean(
      messageId &&
      messageId === seenAnchorMessageId &&
      seenUsers.length > 0
    );

    return {
      ...message,
      __ui: {
        showSenderName,
        showSenderAvatar,
        showTimeSeparator,
        timeSeparatorLabel: showTimeSeparator
          ? formatSeparatorLabel(message?.createdAt)
          : '',
        showSeenAvatars,
        seenUsers,
        deliveryStatus: getDeliveryStatus(message),
      },
    };
  });
}