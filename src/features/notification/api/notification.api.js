import httpClient from '@/shared/lib/httpClient';
import { tokenManager } from '@/shared/lib/tokenManager';
import { apiConfig } from '@/config/api.config';

const NOTIFICATION_BASE_URL = '/notifications';

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function resolveBaseUrl() {
  const rawBase =
    httpClient?.defaults?.baseURL || apiConfig?.baseURL || window.location.origin;

  try {
    return new URL(rawBase, window.location.origin).toString();
  } catch {
    return window.location.origin;
  }
}

function joinUrl(base, path) {
  return `${String(base).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}

function createNotificationUrl(path = '') {
  return `${NOTIFICATION_BASE_URL}${path}`;
}

export const notificationApi = {
  async getNotifications({ page = 1, limit = 20 } = {}) {
    const response = await httpClient.get(createNotificationUrl(), {
      params: { page, limit },
    });
    return unwrapResponse(response);
  },

  async getUnreadCount() {
    const response = await httpClient.get(createNotificationUrl('/unread-count'));
    return unwrapResponse(response);
  },

  async markAsRead(notificationId) {
    const response = await httpClient.patch(
      createNotificationUrl(`/${notificationId}/read`)
    );
    return unwrapResponse(response);
  },

  async markAllAsRead() {
    const response = await httpClient.patch(createNotificationUrl('/read-all'));
    return unwrapResponse(response);
  },

  async deleteNotification(notificationId) {
    const response = await httpClient.delete(createNotificationUrl(`/${notificationId}`));
    return unwrapResponse(response);
  },

  async getSettings() {
    const response = await httpClient.get(createNotificationUrl('/settings'));
    return unwrapResponse(response);
  },

  async updateSettings(payload) {
    const response = await httpClient.patch(
      createNotificationUrl('/settings'),
      payload
    );
    return unwrapResponse(response);
  },

  async createStreamSession() {
    const response = await httpClient.post(createNotificationUrl('/stream/session'));
    return unwrapResponse(response);
  },
async getNotificationById(notificationId) {
  const response = await httpClient.get(createNotificationUrl(`/${notificationId}`));
  return unwrapResponse(response);
},
  hasAccessToken() {
    return Boolean(tokenManager.getAccessToken());
  },

  getStreamUrl() {
    return joinUrl(resolveBaseUrl(), 'notifications/stream/events');
  },

  isCrossOriginStream() {
    try {
      const streamOrigin = new URL(this.getStreamUrl()).origin;
      return streamOrigin !== window.location.origin;
    } catch {
      return false;
    }
  },
};

export default notificationApi;