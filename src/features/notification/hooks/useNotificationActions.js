import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { NOTIFICATION_QUERY_KEYS } from '../constants/notification.constants';

function patchNotificationListQueries(queryClient, updater) {
  queryClient.setQueriesData(
    { queryKey: NOTIFICATION_QUERY_KEYS.list },
    (previous) => {
      if (!previous) return previous;
      return updater(previous);
    }
  );
}

export function useNotificationActions() {
  const queryClient = useQueryClient();

  const invalidateNotificationQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list }),
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      }),
    ]);
  };

  const markAsRead = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: async (data, notificationId) => {
      if (!data?.item) {
        await invalidateNotificationQueries();
        return;
      }

      patchNotificationListQueries(queryClient, (previous) => ({
        ...previous,
        items: (previous.items || []).map((item) =>
          item.id === notificationId
            ? {
                ...item,
                isRead: true,
                readAt: data.item.readAt || item.readAt || null,
              }
            : item
        ),
      }));

      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.unreadCount,
        data?.unreadCount ?? 0
      );
    },
    onError: invalidateNotificationQueries,
  });

  const markAllAsRead = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: (data) => {
      patchNotificationListQueries(queryClient, (previous) => ({
        ...previous,
        items: (previous.items || []).map((item) => ({
          ...item,
          isRead: true,
          readAt: data?.readAt || item.readAt || null,
        })),
      }));

      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unreadCount, 0);
    },
    onError: invalidateNotificationQueries,
  });

  const deleteNotification = useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: async (data, notificationId) => {
      if (!data?.item) {
        await invalidateNotificationQueries();
        return;
      }

      patchNotificationListQueries(queryClient, (previous) => {
        const nextTotal = Math.max((previous.pagination?.total || 1) - 1, 0);
        const limit = previous.pagination?.limit || 20;

        return {
          ...previous,
          items: (previous.items || []).filter((item) => item.id !== notificationId),
          pagination: {
            ...previous.pagination,
            total: nextTotal,
            totalPages: Math.max(1, Math.ceil(nextTotal / limit)),
          },
        };
      });

      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.unreadCount,
        data?.unreadCount ?? 0
      );
    },
    onError: invalidateNotificationQueries,
  });

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}