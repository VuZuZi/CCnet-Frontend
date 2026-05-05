export const CHAT_EVENTS = {
  MESSAGE_NEW: 'chat:message:new',
  MESSAGE_UPDATED: 'chat:message:updated',
  MESSAGE_READ: 'chat:message:read',
  CONVERSATION_UPDATED: 'chat:conversation:updated',
  MESSAGE_PINNED: 'chat:message:pinned',
  MESSAGE_UNPINNED: 'chat:message:unpinned',
  NOTIFY: 'chat:notify',
  USER_BANNED: 'auth:user:banned',
  USER_STATUS_CHANGED: 'auth:user:status-changed',
  USER_JOIN: 'user:join',
  JOIN: 'join',
  LEAVE: 'leave',
};

export const CHAT_ASSET_TYPES = {
  IMAGE: 'image',
  FILE: 'file',
  LINK: 'link',
};

export const CHAT_ASSET_PAGE_LIMIT = 30;

export const CHAT_ASSET_TABS = [
  { key: CHAT_ASSET_TYPES.IMAGE, label: 'Tệp phương tiện' },
  { key: CHAT_ASSET_TYPES.FILE, label: 'Tệp' },
  { key: CHAT_ASSET_TYPES.LINK, label: 'Liên kết' },
];
