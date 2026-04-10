import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { useToast } from '@/shared/contexts/ToastContext';
import { GLOBAL_QUERY_KEYS } from '@/shared/constants/queryKeys';
import { globalEventBus, APP_EVENTS } from '@/shared/lib/eventBus';
import {
  NOTIFICATION_QUERY_KEYS,
  NOTIFICATION_SSE_EVENTS,
} from '../constants/notification.constants';
import { transformNotification } from '../utils/notification.transformer';
import { calculateTotalPages } from '../utils/notification.helpers';

const SESSION_REQUEST_COOLDOWN_MS = 2000;
const MAX_RECONNECT_DELAY_MS = 30000;
const DEV_STRICTMODE_CLEANUP_GRACE_MS = 1200;

function patchNotificationListQueries(queryClient, updater) {
  queryClient.setQueriesData(
    { queryKey: NOTIFICATION_QUERY_KEYS.list },
    (previous) => {
      if (!previous) return previous;
      return updater(previous);
    }
  );
}

function prependUniqueItem(previous, incomingItem) {
  const currentItems = previous.items || [];
  const deduped = currentItems.filter((item) => item.id !== incomingItem.id);
  const nextItems = [incomingItem, ...deduped];
  const limit = previous.pagination?.limit || nextItems.length;
  const currentTotal = previous.pagination?.total || 0;
  const alreadyExists = currentItems.some((item) => item.id === incomingItem.id);
  const nextTotal = alreadyExists ? currentTotal : currentTotal + 1;

  return {
    ...previous,
    items: nextItems.slice(0, limit),
    pagination: {
      ...previous.pagination,
      total: nextTotal,
      totalPages: calculateTotalPages(nextTotal, limit),
    },
  };
}

function markNotificationAsRead(previous, notificationId, readAt = null) {
  return {
    ...previous,
    items: (previous.items || []).map((item) =>
      item.id === notificationId
        ? {
          ...item,
          isRead: true,
          readAt: readAt || item.readAt || null,
        }
        : item
    ),
  };
}

function markAllNotificationsAsRead(previous, readAt = null) {
  return {
    ...previous,
    items: (previous.items || []).map((item) => ({
      ...item,
      isRead: true,
      readAt: readAt || item.readAt || null,
    })),
  };
}

function removeNotification(previous, notificationId) {
  const nextItems = (previous.items || []).filter((item) => item.id !== notificationId);
  const currentTotal = previous.pagination?.total || 0;
  const limit = previous.pagination?.limit || 20;
  const nextTotal = Math.max(currentTotal - 1, 0);

  return {
    ...previous,
    items: nextItems,
    pagination: {
      ...previous.pagination,
      total: nextTotal,
      totalPages: Math.max(1, Math.ceil(nextTotal / limit)),
    },
  };
}

function patchProjectInsideList(list, projectId, nextStatus) {
  if (!Array.isArray(list)) return list;

  return list.map((project) =>
    String(project?._id) === String(projectId)
      ? { ...project, status: nextStatus }
      : project
  );
}

function patchProjectQueries(queryClient, projectId, nextStatus) {
  if (!projectId || !nextStatus) return;

  queryClient.setQueriesData(
    { queryKey: GLOBAL_QUERY_KEYS.PROJECT_WORKSPACE },
    (previous) => {
      if (!previous || !Array.isArray(previous.projects)) return previous;
      return {
        ...previous,
        projects: patchProjectInsideList(previous.projects, projectId, nextStatus),
      };
    }
  );

  queryClient.setQueryData(
    GLOBAL_QUERY_KEYS.PROJECT_ADMIN_LIST,
    (previous) => {
      if (!Array.isArray(previous)) return previous;
      return patchProjectInsideList(previous, projectId, nextStatus);
    }
  );

  queryClient.setQueriesData(
    { queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) },
    (previous) => {
      if (!previous) return previous;
      if (String(previous._id) !== String(projectId)) return previous;
      return { ...previous, status: nextStatus };
    }
  );
}

const runtime = {
  eventSource: null,
  reconnectTimer: null,
  connectPromise: null,
  retryAttempt: 0,
  subscriberCount: 0,
  currentUserId: null,
  sessionRequestedAt: 0,
  suppressReconnectUntil: 0,
  pendingCleanupTimer: null,
};

function clearReconnectTimer() {
  if (!runtime.reconnectTimer) return;
  window.clearTimeout(runtime.reconnectTimer);
  runtime.reconnectTimer = null;
}

function clearPendingCleanupTimer() {
  if (!runtime.pendingCleanupTimer) return;
  window.clearTimeout(runtime.pendingCleanupTimer);
  runtime.pendingCleanupTimer = null;
}

function detachEventSourceListeners(source, handlers) {
  if (!source || !handlers) return;
  source.removeEventListener(NOTIFICATION_SSE_EVENTS.CONNECTED, handlers.connected);
  source.removeEventListener(NOTIFICATION_SSE_EVENTS.CREATED, handlers.created);
  source.removeEventListener(NOTIFICATION_SSE_EVENTS.UNREAD_COUNT, handlers.unreadCount);
  source.removeEventListener(NOTIFICATION_SSE_EVENTS.READ, handlers.read);
  source.removeEventListener(NOTIFICATION_SSE_EVENTS.READ_ALL, handlers.readAll);
  source.removeEventListener(NOTIFICATION_SSE_EVENTS.DELETED, handlers.deleted);
}

function closeEventSource() {
  if (!runtime.eventSource) return;
  runtime.eventSource.close();
  runtime.eventSource = null;
}

function resetRuntime() {
  clearReconnectTimer();
  clearPendingCleanupTimer();
  closeEventSource();
  runtime.connectPromise = null;
  runtime.retryAttempt = 0;
  runtime.currentUserId = null;
  runtime.sessionRequestedAt = 0;
  runtime.suppressReconnectUntil = 0;
}

function scheduleResetRuntime() {
  clearPendingCleanupTimer();
  runtime.pendingCleanupTimer = window.setTimeout(() => {
    runtime.pendingCleanupTimer = null;
    if (runtime.subscriberCount === 0) {
      resetRuntime();
    }
  }, DEV_STRICTMODE_CLEANUP_GRACE_MS);
}

function shouldThrottleSessionRequest() {
  return Date.now() - runtime.sessionRequestedAt < SESSION_REQUEST_COOLDOWN_MS;
}

export function useNotificationStream({ enabled = true, userId = null } = {}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    const normalizedUserId = userId ? String(userId) : null;

    if (!enabled || !normalizedUserId) {
      return undefined;
    }

    clearPendingCleanupTimer();
    runtime.subscriberCount += 1;

    if (runtime.currentUserId && runtime.currentUserId !== normalizedUserId) {
      resetRuntime();
    }
    runtime.currentUserId = normalizedUserId;

    const setUnreadCount = (unreadCount) => {
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.unreadCount,
        unreadCount ?? 0
      );
    };

    const invalidateNotificationList = () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list });
    };

    const invalidateUnreadCount = () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      });
    };

    const handleConnected = () => {
      runtime.retryAttempt = 0;
      runtime.suppressReconnectUntil = 0;
      clearReconnectTimer();
    };

    const handleCreated = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const item = transformNotification(payload.notification);
        if (!item?.id && !item?.type) return;

        // Lưu vào cache danh sách chuông thông báo
        patchNotificationListQueries(queryClient, (previous) =>
          prependUniqueItem(previous, item)
        );

        const projectId =
          item.entityId ||
          item.metadata?.projectId ||
          payload.notification?.metadata?.projectId;

        if (item.type === 'organizer_request_updated') {
          queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.ORGANIZER_REQUEST_ME });
          queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROFILE_ME });
        }

        if (item.type === 'project_updated') {
          const nextStatus =
            item.metadata?.status || payload.notification?.metadata?.status || null;
          patchProjectQueries(queryClient, projectId, nextStatus);
        }

        if (item.type === 'donation_successful') {
          toast.success(`🎉 Giao dịch thành công! Dự án vừa nhận được đóng góp.`);

          queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.WALLET_ME });
          queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.WALLET_HISTORY });

          if (projectId) {
            queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });

            globalEventBus.dispatchEvent(
              new CustomEvent(APP_EVENTS.DONATION_SUCCESS, {
                detail: { projectId: String(projectId) }
              })
            );
          }
        }

        if (item.type === 'transaction_failed') {
          toast.error(`❌ Giao dịch thất bại hoặc đã bị hủy từ phía ngân hàng.`);
        }

        if (item.type === 'transaction_refunded') {
          toast.success(`Hoàn tiền dự án thành công. Số dư đã được cộng lại vào ví cá nhân của bạn.`);

          queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.WALLET_ME });
          queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.WALLET_HISTORY });

          if (projectId) {
            queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) });
          }
        }
      } catch (err) {
        console.error('SSE Created Handler Error:', err);
        invalidateNotificationList();
      }
    };

    const handleUnreadCount = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setUnreadCount(payload.unreadCount ?? 0);
      } catch {
        invalidateUnreadCount();
      }
    };

    const handleRead = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const notificationId = payload.notificationId;
        if (!notificationId) return;

        patchNotificationListQueries(queryClient, (previous) =>
          markNotificationAsRead(previous, notificationId, payload.readAt || null)
        );
      } catch {
        invalidateNotificationList();
      }
    };

    const handleReadAll = (event) => {
      try {
        const payload = JSON.parse(event.data);
        patchNotificationListQueries(queryClient, (previous) =>
          markAllNotificationsAsRead(previous, payload.readAt || null)
        );
        setUnreadCount(0);
      } catch {
        invalidateNotificationList();
        invalidateUnreadCount();
      }
    };

    const handleDeleted = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const notificationId = payload.notificationId;
        if (!notificationId) return;

        patchNotificationListQueries(queryClient, (previous) =>
          removeNotification(previous, notificationId)
        );
      } catch {
        invalidateNotificationList();
      }
    };

    const scheduleReconnect = () => {
      const now = Date.now();
      if (runtime.reconnectTimer || !runtime.currentUserId || runtime.subscriberCount === 0) return;
      if (!notificationApi.hasAccessToken()) return;
      if (runtime.suppressReconnectUntil > now) return;

      const delay = Math.min(3000 * 2 ** runtime.retryAttempt, MAX_RECONNECT_DELAY_MS);
      runtime.retryAttempt += 1;

      runtime.reconnectTimer = window.setTimeout(() => {
        runtime.reconnectTimer = null;
        void connect();
      }, delay);
    };

    const connect = async () => {
      if (!runtime.currentUserId || !notificationApi.hasAccessToken() || runtime.eventSource) return;
      if (runtime.connectPromise) return runtime.connectPromise;

      runtime.connectPromise = (async () => {
        let source = null;
        let handlers = null;

        try {
          if (!shouldThrottleSessionRequest()) {
            runtime.sessionRequestedAt = Date.now();
            await notificationApi.createStreamSession();
          }

          const streamUrl = notificationApi.getStreamUrl();
          const withCredentials = notificationApi.isCrossOriginStream();

          source = new EventSource(streamUrl, { withCredentials });

          handlers = {
            connected: handleConnected,
            created: handleCreated,
            unreadCount: handleUnreadCount,
            read: handleRead,
            readAll: handleReadAll,
            deleted: handleDeleted,
          };

          source.addEventListener(NOTIFICATION_SSE_EVENTS.CONNECTED, handlers.connected);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.CREATED, handlers.created);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.UNREAD_COUNT, handlers.unreadCount);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.READ, handlers.read);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.READ_ALL, handlers.readAll);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.DELETED, handlers.deleted);

          source.onerror = () => {
            detachEventSourceListeners(source, handlers);
            if (runtime.eventSource === source) closeEventSource();
            runtime.suppressReconnectUntil = Date.now() + 1500;
            scheduleReconnect();
          };

          runtime.eventSource = source;
        } catch {
          runtime.suppressReconnectUntil = Date.now() + 1500;
          if (source) {
            detachEventSourceListeners(source, handlers);
            source.close();
          }
          scheduleReconnect();
        } finally {
          runtime.connectPromise = null;
        }
      })();

      return runtime.connectPromise;
    };

    void connect();

    return () => {
      runtime.subscriberCount = Math.max(0, runtime.subscriberCount - 1);
      if (runtime.subscriberCount === 0) {
        scheduleResetRuntime();
      }
    };
  }, [enabled, userId, queryClient, toast]);

  useEffect(() => {
    if (!enabled || !userId) {
      if (runtime.subscriberCount === 0) scheduleResetRuntime();
    }
  }, [enabled, userId]);
}