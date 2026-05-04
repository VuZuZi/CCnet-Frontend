import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/contexts/ToastContext';
import { organizerRequestAdminAPI, getErrorMessage } from '../api/organizerRequestAdminAPI';

export function useOrganizerRequestDetail(id) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ['admin', 'organizer-request', id],
    queryFn: () => organizerRequestAdminAPI.getRequestDetail(id),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => organizerRequestAdminAPI.approveRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'organizer-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'organizer-request', id] });
      await queryClient.invalidateQueries({ queryKey: ['organizer-request', 'me'] });
      toast.success('Đã duyệt hồ sơ tổ chức');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const declineMutation = useMutation({
    mutationFn: (payload) => organizerRequestAdminAPI.declineRequest(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'organizer-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'organizer-request', id] });
      await queryClient.invalidateQueries({ queryKey: ['organizer-request', 'me'] });
      toast.success('Đã từ chối hồ sơ tổ chức');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    request: detailQuery.data || null,
    isLoading: detailQuery.isLoading,
    approve: approveMutation.mutateAsync,
    decline: declineMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
}
