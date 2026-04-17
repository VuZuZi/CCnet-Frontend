import {
  formatNotificationDateTime,
  getNotificationLabel,
  getNotificationPrimaryActionLabel,
  shouldAllowNotificationDetail,
  shouldPreferRelatedNavigation,
} from './notification.helpers.js';

function normalizeFollowActionUrl(raw) {
  const rawActionUrl = raw?.actionUrl || null;
  const actorId =
    raw?.actorId ||
    raw?.metadata?.actorId ||
    raw?.metadata?.followerId ||
    null;

  const isLegacyFollowUrl =
    rawActionUrl === '/profile/followers' ||
    rawActionUrl === '/followers' ||
    rawActionUrl === null ||
    rawActionUrl === '';

  if (raw?.type !== 'follow_created') {
    return rawActionUrl;
  }

  if (!isLegacyFollowUrl) {
    return rawActionUrl;
  }

  if (!actorId) {
    return '/following?tab=followers';
  }

  return `/following?tab=followers&highlightUser=${encodeURIComponent(String(actorId))}`;
}

export function transformNotification(raw) {
  const actionUrl = normalizeFollowActionUrl(raw);

  return {
    id: raw?._id || raw?.id,
    _id: raw?._id || raw?.id,
    type: raw?.type || '',
    label: getNotificationLabel(raw?.type),
    title: raw?.title || '',
    message: raw?.message || '',
    actionUrl,
    isRead: Boolean(raw?.isRead),
    readAt: raw?.readAt || null,
    createdAt: raw?.createdAt || null,
    createdAtLabel: formatNotificationDateTime(raw?.createdAt),
    metadata: raw?.metadata || {},
    actorId: raw?.actorId || raw?.metadata?.actorId || null,
    severity: raw?.severity || raw?.metadata?.severity || 'info',
    primaryActionLabel: getNotificationPrimaryActionLabel(raw?.type, actionUrl),
    prefersRelatedNavigation: shouldPreferRelatedNavigation(raw?.type, actionUrl),
    canOpenDetail: shouldAllowNotificationDetail(raw?.type, actionUrl),
  };
}

export function transformNotificationListResponse(response) {
  return {
    items: Array.isArray(response?.items)
      ? response.items.map(transformNotification).filter((item) => item.id)
      : [],
    pagination: response?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
  };
}