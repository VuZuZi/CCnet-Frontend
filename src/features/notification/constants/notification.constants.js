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

export const REALTIME_NOTIFICATION_TYPES = Object.freeze({
  HELP_REQUEST_ASSIGNED: 'help_request_assigned',
  HELP_REQUEST_REASSIGNED: 'help_request_reassigned',
  HELP_REQUEST_VERIFIED: 'help_request_verified',
  HELP_REQUEST_REJECTED: 'help_request_rejected',
  HELP_REQUEST_COMPLETED: 'help_request_completed',
  HELP_REQUEST_ASSIGNMENT_RESPONDED: 'help_request_assignment_responded',
  ORGANIZER_REQUEST_UPDATED: 'organizer_request_updated',
  PROJECT_UPDATED: 'project_updated',
  DONATION_SUCCESSFUL: 'donation_successful',
  TRANSACTION_FAILED: 'transaction_failed',
  TRANSACTION_REFUNDED: 'transaction_refunded',
});

export const HELP_REQUEST_REALTIME_TYPES = Object.freeze([
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_ASSIGNED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_REASSIGNED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_VERIFIED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_REJECTED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_COMPLETED,
  REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_ASSIGNMENT_RESPONDED,
]);