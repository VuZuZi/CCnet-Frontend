import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { NOTIFICATION_QUERY_KEYS } from '../constants/notification.constants';

export function useNotificationSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.settings,
    queryFn: () => notificationApi.getSettings(),
  });

  const updateSettings = useMutation({
    mutationFn: notificationApi.updateSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.settings,
      });
    },
  });

  return {
    settingsQuery,
    updateSettings,
  };
}