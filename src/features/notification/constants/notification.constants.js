export const NOTIFICATION_QUERY_KEYS = Object.freeze({
  all: ['notifications'],
  list: ['notifications', 'list'],
  unreadCount: ['notifications', 'unread-count'],
  settings: ['notifications', 'settings'],
});

export const NOTIFICATION_SSE_EVENTS = Object.freeze({
  CONNECTED: 'notification.connected',
  CREATED: 'notification.created',
  READ: 'notification.read',
  READ_ALL: 'notification.read_all',
  DELETED: 'notification.deleted',
  UNREAD_COUNT: 'notification.unread_count',
  HEARTBEAT: 'notification.heartbeat',

  DONATION_SUCCESSFUL: 'donation.successful',
});