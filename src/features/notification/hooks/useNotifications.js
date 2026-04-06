import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { NOTIFICATION_QUERY_KEYS } from '../constants/notification.constants';
import { transformNotificationListResponse } from '../utils/notification.transformer';

export function useNotifications({ page = 1, limit = 20 } = {}) {
  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEYS.list, page, limit],
    queryFn: async () => {
      const response = await notificationApi.getNotifications({ page, limit });
      return transformNotificationListResponse(response);
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 30000,
  });
}