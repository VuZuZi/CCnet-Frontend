export const CHAT_EVENTS = {
  MESSAGE_NEW: 'chat:message:new',
  MESSAGE_UPDATED: 'chat:message:updated',
  MESSAGE_READ: 'chat:message:read',
  CONVERSATION_UPDATED: 'chat:conversation:updated',
  NOTIFY: 'chat:notify',
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
  { key: CHAT_ASSET_TYPES.IMAGE, label: 'File phương tiện' },
  { key: CHAT_ASSET_TYPES.FILE, label: 'File' },
  { key: CHAT_ASSET_TYPES.LINK, label: 'Liên kết' },
];