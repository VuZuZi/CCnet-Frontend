import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { NOTIFICATION_QUERY_KEYS } from '../constants/notification.constants';

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: async () => {
      const data = await notificationApi.getUnreadCount();
      return data.unreadCount ?? 0;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 30000,
  });
}