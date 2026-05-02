import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notification.api";
import { useToast } from "@/shared/contexts/ToastContext";
import { GLOBAL_QUERY_KEYS } from "@/shared/constants/queryKeys";
import { globalEventBus, APP_EVENTS } from "@/shared/lib/eventBus";
import {
  HELP_REQUEST_REALTIME_TYPES,
  NOTIFICATION_QUERY_KEYS,
  NOTIFICATION_SSE_EVENTS,
  REALTIME_NOTIFICATION_TYPES,
  VOLUNTEER_REALTIME_TYPES,
} from "../constants/notification.constants";
import { transformNotification } from "../utils/notification.transformer";
import { calculateTotalPages } from "../utils/notification.helpers";
import { TRANSACTION_QUERY_KEYS } from "@/features/transaction/constants/transaction.queryKeys";
import { HELP_REQUEST_KEYS } from "@/features/needHelp/hooks/useHelpRequestQueries";
import {
  PROJECT_FEED_QUERY_KEYS,
  PROJECT_QUERY_KEYS,
} from "@/features/project/hooks/useProjectQueries";
import { volunteerQueryKeys } from "@/features/volunteer/hooks/useVolunteerQueries";
import {
  ADMIN_QUERY_KEYS,
  ADMIN_PROJECTS_QUERY_KEY,
  ADMIN_STATS_QUERY_KEY,
} from "@/features/admin/constants/admin.queryKeys";

const SESSION_REQUEST_COOLDOWN_MS = 2000;
const MAX_RECONNECT_DELAY_MS = 30000;
const DEV_STRICTMODE_CLEANUP_GRACE_MS = 1200;

function patchNotificationListQueries(queryClient, updater) {
  queryClient.setQueriesData({ queryKey: NOTIFICATION_QUERY_KEYS.list }, (previous) => {
    if (!previous) return previous;
    return updater(previous);
  });
}

function prependUniqueItem(previous, incomingItem) {
  const currentItems = previous?.items || [];
  const deduped = currentItems.filter((item) => item.id !== incomingItem.id);
  const nextItems = [incomingItem, ...deduped];
  const limit = previous?.pagination?.limit || nextItems.length;
  const currentTotal = previous?.pagination?.total || 0;
  const alreadyExists = currentItems.some((item) => item.id === incomingItem.id);
  const nextTotal = alreadyExists ? currentTotal : currentTotal + 1;

  return {
    ...previous,
    items: nextItems.slice(0, limit),
    pagination: {
      ...previous?.pagination,
      total: nextTotal,
      totalPages: calculateTotalPages(nextTotal, limit),
    },
  };
}

function markNotificationAsRead(previous, notificationId, readAt = null) {
  return {
    ...previous,
    items: (previous?.items || []).map((item) =>
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
    items: (previous?.items || []).map((item) => ({
      ...item,
      isRead: true,
      readAt: readAt || item.readAt || null,
    })),
  };
}

function removeNotification(previous, notificationId) {
  const nextItems = (previous?.items || []).filter((item) => item.id !== notificationId);
  const currentTotal = previous?.pagination?.total || 0;
  const limit = previous?.pagination?.limit || 20;
  const nextTotal = Math.max(currentTotal - 1, 0);

  return {
    ...previous,
    items: nextItems,
    pagination: {
      ...previous?.pagination,
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

function patchAdminProjectsCache(previous, projectId, nextStatus) {
  if (!previous) return previous;

  if (Array.isArray(previous)) {
    return patchProjectInsideList(previous, projectId, nextStatus);
  }

  if (Array.isArray(previous?.items)) {
    return {
      ...previous,
      items: patchProjectInsideList(previous.items, projectId, nextStatus),
    };
  }

  return previous;
}

function invalidateProjectQueries(queryClient, projectId = null) {
  queryClient.invalidateQueries({
    queryKey: PROJECT_QUERY_KEYS.all,
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: PROJECT_QUERY_KEYS.featured,
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: PROJECT_QUERY_KEYS.volunteerNeeded,
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: ADMIN_PROJECTS_QUERY_KEY,
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: ADMIN_STATS_QUERY_KEY,
    exact: false,
  });

  if (projectId) {
    queryClient.invalidateQueries({
      queryKey: PROJECT_QUERY_KEYS.detail(projectId),
      exact: true,
    });

    queryClient.invalidateQueries({
      queryKey: PROJECT_QUERY_KEYS.draftDetail(projectId),
      exact: true,
    });

    queryClient.invalidateQueries({
      queryKey: PROJECT_FEED_QUERY_KEYS.posts(projectId),
      exact: false,
    });

    queryClient.invalidateQueries({
      queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId),
      exact: false,
    });
  }

  queryClient.refetchQueries({
    queryKey: PROJECT_QUERY_KEYS.all,
    exact: false,
    type: "active",
  });

  queryClient.refetchQueries({
    queryKey: PROJECT_QUERY_KEYS.featured,
    exact: false,
    type: "active",
  });

  queryClient.refetchQueries({
    queryKey: PROJECT_QUERY_KEYS.volunteerNeeded,
    exact: false,
    type: "active",
  });

  queryClient.refetchQueries({
    queryKey: ADMIN_PROJECTS_QUERY_KEY,
    exact: false,
    type: "active",
  });

  queryClient.refetchQueries({
    queryKey: ADMIN_STATS_QUERY_KEY,
    exact: false,
    type: "active",
  });
}

function patchProjectQueries(queryClient, projectId, nextStatus) {
  if (!projectId || !nextStatus) return;

  queryClient.setQueriesData({ queryKey: PROJECT_QUERY_KEYS.workspace({}) }, (previous) => {
    if (!previous || !Array.isArray(previous.projects)) return previous;
    return {
      ...previous,
      projects: patchProjectInsideList(previous.projects, projectId, nextStatus),
    };
  });

  queryClient.setQueriesData({ queryKey: PROJECT_QUERY_KEYS.all }, (previous) => {
    if (!previous) return previous;

    if (Array.isArray(previous?.projects)) {
      return {
        ...previous,
        projects: patchProjectInsideList(previous.projects, projectId, nextStatus),
      };
    }

    if (Array.isArray(previous?.items)) {
      return {
        ...previous,
        items: patchProjectInsideList(previous.items, projectId, nextStatus),
      };
    }

    return previous;
  });

  queryClient.setQueryData(ADMIN_PROJECTS_QUERY_KEY, (previous) =>
    patchAdminProjectsCache(previous, projectId, nextStatus)
  );

  queryClient.setQueryData(PROJECT_QUERY_KEYS.detail(projectId), (previous) => {
    if (!previous) return previous;
    if (String(previous._id) !== String(projectId)) return previous;
    return { ...previous, status: nextStatus };
  });

  queryClient.setQueriesData(
    { queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId) },
    (previous) => {
      if (!previous) return previous;
      if (String(previous._id) !== String(projectId)) return previous;
      return { ...previous, status: nextStatus };
    }
  );

  invalidateProjectQueries(queryClient, projectId);
}

function invalidateHelpRequestQueries(queryClient, helpRequestId = null) {
  queryClient.invalidateQueries({ queryKey: HELP_REQUEST_KEYS.all });

  queryClient.invalidateQueries({
    queryKey: HELP_REQUEST_KEYS.details(),
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: HELP_REQUEST_KEYS.organizerAssignedRoot(),
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: HELP_REQUEST_KEYS.urgent(),
    exact: false,
  });

  if (helpRequestId) {
    queryClient.invalidateQueries({
      queryKey: HELP_REQUEST_KEYS.detail(helpRequestId),
      exact: true,
    });

    queryClient.invalidateQueries({
      queryKey: HELP_REQUEST_KEYS.asProject(helpRequestId),
      exact: true,
    });
  }

  queryClient.refetchQueries({
    queryKey: HELP_REQUEST_KEYS.organizerAssignedRoot(),
    exact: false,
    type: "active",
  });

  queryClient.refetchQueries({
    queryKey: HELP_REQUEST_KEYS.details(),
    exact: false,
    type: "active",
  });

  queryClient.refetchQueries({
    queryKey: HELP_REQUEST_KEYS.all,
    exact: false,
    type: "active",
  });
}

function patchHelpRequestDetailQuery(queryClient, helpRequestId, patch) {
  if (!helpRequestId || !patch) return;

  queryClient.setQueryData(HELP_REQUEST_KEYS.detail(helpRequestId), (previous) => {
    if (!previous) return previous;
    if (String(previous._id) !== String(helpRequestId)) return previous;
    return { ...previous, ...patch };
  });
}

function invalidateVolunteerQueries(queryClient, projectId = null) {
  queryClient.invalidateQueries({
    queryKey: volunteerQueryKeys.applicationRoot,
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: volunteerQueryKeys.projectApplicationsRoot,
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: volunteerQueryKeys.pendingApplicationsRoot,
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: volunteerQueryKeys.supportedProjectsRoot,
    exact: false,
  });

  if (projectId) {
    queryClient.invalidateQueries({
      queryKey: volunteerQueryKeys.projectApplications(projectId),
      exact: false,
    });
  }

  queryClient.refetchQueries({
    queryKey: volunteerQueryKeys.applicationRoot,
    exact: false,
    type: "active",
  });

  queryClient.refetchQueries({
    queryKey: volunteerQueryKeys.projectApplicationsRoot,
    exact: false,
    type: "active",
  });

  queryClient.refetchQueries({
    queryKey: volunteerQueryKeys.supportedProjectsRoot,
    exact: false,
    type: "active",
  });

  invalidateProjectQueries(queryClient, projectId);
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
  source.removeEventListener("message", handlers.message);
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
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unreadCount, unreadCount ?? 0);
    };

    const bumpUnreadCount = () => {
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unreadCount, (previous) => {
        const current = Number(previous ?? 0);
        return current + 1;
      });
    };

    const invalidateNotificationList = () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list });
    };

    const invalidateUnreadCount = () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      });
    };

    const refreshAllNotificationQueries = () => {
      invalidateNotificationList();
      invalidateUnreadCount();
    };

    const handleConnected = () => {
      runtime.retryAttempt = 0;
      runtime.suppressReconnectUntil = 0;
      clearReconnectTimer();
      refreshAllNotificationQueries();
    };

    const processCreatedPayload = (payload) => {
      const item = transformNotification(payload.notification || payload);
      if (!item?.id && !item?.type) return;

      if (item?.id) {
        let didPatchAtLeastOneList = false;

        patchNotificationListQueries(queryClient, (previous) => {
          didPatchAtLeastOneList = true;
          return prependUniqueItem(previous, item);
        });

        if (!didPatchAtLeastOneList) {
          invalidateNotificationList();
        }

        if (!item.isRead) {
          bumpUnreadCount();
        }
      }

      const projectId =
        item.entityId ||
        item.metadata?.projectId ||
        payload.notification?.metadata?.projectId ||
        payload.notification?.entityId ||
        payload.metadata?.projectId ||
        null;

      const helpRequestId =
        item.entityId ||
        item.metadata?.helpRequestId ||
        payload.notification?.metadata?.helpRequestId ||
        payload.metadata?.helpRequestId ||
        null;

      if (HELP_REQUEST_REALTIME_TYPES.includes(item.type)) {
        invalidateHelpRequestQueries(queryClient, helpRequestId);

        if (helpRequestId) {
          if (item.type === REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_VERIFIED) {
            patchHelpRequestDetailQuery(queryClient, helpRequestId, {
              status: "VERIFIED",
              rejectionReason: null,
            });
          }

          if (item.type === REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_REJECTED) {
            patchHelpRequestDetailQuery(queryClient, helpRequestId, {
              status: "REJECTED",
              rejectionReason:
                item.metadata?.rejectionReason ||
                payload.notification?.metadata?.rejectionReason ||
                payload.metadata?.rejectionReason ||
                null,
            });
          }

          if (item.type === REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_COMPLETED) {
            patchHelpRequestDetailQuery(queryClient, helpRequestId, {
              status: "COMPLETED",
            });
          }

          if (
            item.type === REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_ASSIGNED ||
            item.type === REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_REASSIGNED
          ) {
            patchHelpRequestDetailQuery(queryClient, helpRequestId, {
              status: "VERIFIED",
            });
          }

          if (item.type === REALTIME_NOTIFICATION_TYPES.HELP_REQUEST_ASSIGNMENT_RESPONDED) {
            const action =
              item.metadata?.action ||
              payload.notification?.metadata?.action ||
              payload.metadata?.action ||
              null;

            if (action === "accepted") {
              patchHelpRequestDetailQuery(queryClient, helpRequestId, {
                status: "IN_PROGRESS",
              });
            }

            if (action === "rejected") {
              patchHelpRequestDetailQuery(queryClient, helpRequestId, {
                status: "VERIFIED",
                assignedOrganizerId: null,
                assignedAt: null,
              });
            }
          }
        }
      }

      if (VOLUNTEER_REALTIME_TYPES.includes(item.type)) {
        invalidateVolunteerQueries(queryClient, projectId);
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.VOLUNTEER_APPLIED) {
        toast.success("Có đơn đăng ký tình nguyện viên mới.");
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.VOLUNTEER_APPLICATION_APPROVED) {
        toast.success("Đơn tình nguyện đã được duyệt.");
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.VOLUNTEER_APPLICATION_REJECTED) {
        toast.error("Đơn tình nguyện đã bị từ chối.");
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.VOLUNTEER_WITHDRAW_REQUESTED) {
        toast.info("Có yêu cầu xin rút khỏi dự án mới.");
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.VOLUNTEER_WITHDRAW_APPROVED) {
        toast.success("Yêu cầu xin rút đã được chấp thuận.");
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.VOLUNTEER_WITHDRAW_REJECTED) {
        toast.error("Yêu cầu xin rút đã bị từ chối.");
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.ORGANIZER_REQUEST_UPDATED) {
        queryClient.invalidateQueries({
          queryKey: GLOBAL_QUERY_KEYS.ORGANIZER_REQUEST_ME,
        });
        queryClient.invalidateQueries({
          queryKey: GLOBAL_QUERY_KEYS.PROFILE_ME,
        });

        const status =
          item.metadata?.status ||
          payload.notification?.metadata?.status ||
          payload.metadata?.status ||
          null;

        if (status === "APPROVED") {
          toast.success(
            "Hồ sơ đã được phê duyệt nội bộ. Bạn có thể tạo dự án gây quỹ."
          );
        } else if (status === "DECLINED") {
          toast.error(
            "Hồ sơ đăng ký Ban tổ chức chưa được chấp thuận. Vui lòng xem lý do và cập nhật lại nếu cần."
          );
        }
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.ORGANIZER_REQUEST_SUBMITTED) {
        toast.info(
          "Có hồ sơ đăng ký Ban tổ chức mới đang chờ xem xét."
        );
        queryClient.invalidateQueries({
          queryKey: ADMIN_QUERY_KEYS.organizerRequests.all(),
          exact: false,
        });
        queryClient.refetchQueries({
          queryKey: ADMIN_QUERY_KEYS.organizerRequests.all(),
          exact: false,
          type: "active",
        });
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.PROJECT_UPDATED) {
        const nextStatus =
          item.metadata?.status ||
          payload.notification?.metadata?.status ||
          payload.metadata?.status ||
          null;

        patchProjectQueries(queryClient, projectId, nextStatus);
      }

      if (
        item.type === REALTIME_NOTIFICATION_TYPES.DONATION_SUCCESSFUL ||
        item.type === REALTIME_NOTIFICATION_TYPES.TRANSACTION_FAILED
      ) {
        if (item.type === REALTIME_NOTIFICATION_TYPES.DONATION_SUCCESSFUL) {
          toast.success("🎉 Giao dịch thành công! Dự án vừa nhận được đóng góp.");

          queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.WALLET_ME });
          queryClient.invalidateQueries({
            queryKey: GLOBAL_QUERY_KEYS.WALLET_HISTORY,
          });
          queryClient.invalidateQueries({
            queryKey: TRANSACTION_QUERY_KEYS.myDonations(),
          });

          if (projectId) {
            queryClient.invalidateQueries({
              queryKey: GLOBAL_QUERY_KEYS.PROJECT_DETAIL(projectId),
            });
            invalidateProjectQueries(queryClient, projectId);
          }
        } else if (item.type === REALTIME_NOTIFICATION_TYPES.TRANSACTION_FAILED) {
          toast.error("Giao dịch thất bại hoặc đã bị hủy từ phía ngân hàng.");
        }

        if (projectId) {
          globalEventBus.dispatchEvent(
            new CustomEvent(APP_EVENTS.DONATION_SUCCESS, {
              detail: { projectId: String(projectId), status: item.type },
            })
          );
        }
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.TRANSACTION_REFUNDED) {
        toast.success(
          "Hoàn tiền dự án thành công. Số dư đã được cộng lại vào ví cá nhân của bạn."
        );

        queryClient.invalidateQueries({ queryKey: GLOBAL_QUERY_KEYS.WALLET_ME });
        queryClient.invalidateQueries({
          queryKey: GLOBAL_QUERY_KEYS.WALLET_HISTORY,
        });
        queryClient.invalidateQueries({
          queryKey: TRANSACTION_QUERY_KEYS.myDonations(),
        });

        if (projectId) {
          invalidateProjectQueries(queryClient, projectId);

          globalEventBus.dispatchEvent(
            new CustomEvent(APP_EVENTS.REFUND_SUCCESS, {
              detail: { projectId: String(projectId) },
            })
          );
        }
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.REFUND_REQUEST_SUBMITTED) {
        toast.success(
          "Đã gửi yêu cầu hoàn tiền. Quản trị viên sẽ xem xét và phản hồi sớm nhất."
        );

        queryClient.invalidateQueries({
          queryKey: TRANSACTION_QUERY_KEYS.myDonations(),
        });
      }

      if (item.type === REALTIME_NOTIFICATION_TYPES.REFUND_REQUEST_REJECTED) {
        toast.error(
          "Yêu cầu hoàn tiền đã bị từ chối. Vui lòng xem lại chi tiết trong mục ủng hộ."
        );

        queryClient.invalidateQueries({
          queryKey: TRANSACTION_QUERY_KEYS.myDonations(),
        });
      }
    };

    const handleCreated = (event) => {
      try {
        const payload = JSON.parse(event.data);
        processCreatedPayload(payload);
      } catch (err) {
        console.error("SSE Created Handler Error:", err);
      }
    };

    const handleMessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        const eventType =
          payload?.event ||
          payload?.type ||
          payload?.eventType ||
          payload?.notification?.event ||
          payload?.notification?.type ||
          "";

        if (
          eventType === NOTIFICATION_SSE_EVENTS.CREATED ||
          eventType === "notification_created" ||
          payload?.notification ||
          payload?.id
        ) {
          processCreatedPayload(payload);
        }

        if (
          eventType === NOTIFICATION_SSE_EVENTS.UNREAD_COUNT &&
          typeof payload?.unreadCount === "number"
        ) {
          setUnreadCount(payload.unreadCount);
        }
      } catch {
        // bỏ qua message không parse được
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

        if (!notificationId) {
          refreshAllNotificationQueries();
          return;
        }

        let didPatch = false;

        patchNotificationListQueries(queryClient, (previous) => {
          didPatch = true;
          return markNotificationAsRead(previous, notificationId, payload.readAt || null);
        });

        if (!didPatch) {
          invalidateNotificationList();
        }

        if (typeof payload.unreadCount === "number") {
          setUnreadCount(payload.unreadCount);
        } else {
          invalidateUnreadCount();
        }
      } catch {
        refreshAllNotificationQueries();
      }
    };

    const handleReadAll = (event) => {
      try {
        const payload = JSON.parse(event.data);
        let didPatch = false;

        patchNotificationListQueries(queryClient, (previous) => {
          didPatch = true;
          return markAllNotificationsAsRead(previous, payload.readAt || null);
        });

        if (!didPatch) {
          invalidateNotificationList();
        }

        setUnreadCount(0);
      } catch {
        refreshAllNotificationQueries();
      }
    };

    const handleDeleted = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const notificationId = payload.notificationId;

        if (!notificationId) {
          refreshAllNotificationQueries();
          return;
        }

        let didPatch = false;

        patchNotificationListQueries(queryClient, (previous) => {
          didPatch = true;
          return removeNotification(previous, notificationId);
        });

        if (!didPatch) {
          invalidateNotificationList();
        }

        if (typeof payload.unreadCount === "number") {
          setUnreadCount(payload.unreadCount);
        } else {
          invalidateUnreadCount();
        }
      } catch {
        refreshAllNotificationQueries();
      }
    };

    const scheduleReconnect = () => {
      const now = Date.now();
      if (runtime.reconnectTimer || !runtime.currentUserId || runtime.subscriberCount === 0)
        return;
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
      if (!runtime.currentUserId || !notificationApi.hasAccessToken() || runtime.eventSource) {
        return;
      }
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
            message: handleMessage,
          };

          source.addEventListener(NOTIFICATION_SSE_EVENTS.CONNECTED, handlers.connected);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.CREATED, handlers.created);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.UNREAD_COUNT, handlers.unreadCount);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.READ, handlers.read);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.READ_ALL, handlers.readAll);
          source.addEventListener(NOTIFICATION_SSE_EVENTS.DELETED, handlers.deleted);
          source.addEventListener("message", handlers.message);

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
