import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/contexts/ToastContext';
import { organizerRequestAdminAPI, getErrorMessage } from '../api/organizerRequestAdminAPI';
import { queryKeys } from '@/shared/constants/queryKeys';

export function useOrganizerRequestDetail(id) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: queryKeys.adminOrganizerRequests.detail(id),
    queryFn: () => organizerRequestAdminAPI.getRequestDetail(id),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => organizerRequestAdminAPI.approveRequest(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.adminOrganizerRequests.detail(id) });
      const previousRequest = queryClient.getQueryData(queryKeys.adminOrganizerRequests.detail(id));
      
      if (previousRequest) {
        queryClient.setQueryData(queryKeys.adminOrganizerRequests.detail(id), {
          ...previousRequest,
          status: 'APPROVED'
        });
      }
      return { previousRequest };
    },
    onSuccess: async (updatedRequest) => {
      if (updatedRequest) {
        queryClient.setQueryData(queryKeys.adminOrganizerRequests.detail(id), updatedRequest);
      }
      
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminOrganizerRequests.lists() });
      toast.success('Đã duyệt hồ sơ Organizer');
    },
    onError: (error, variables, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(queryKeys.adminOrganizerRequests.detail(id), context.previousRequest);
      }
      toast.error(getErrorMessage(error));
      if (error.response?.status === 400) detailQuery.refetch();
    },
  });

  const declineMutation = useMutation({
    mutationFn: (payload) => organizerRequestAdminAPI.declineRequest(id, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.adminOrganizerRequests.detail(id) });
      const previousRequest = queryClient.getQueryData(queryKeys.adminOrganizerRequests.detail(id));
      
      if (previousRequest) {
        queryClient.setQueryData(queryKeys.adminOrganizerRequests.detail(id), {
          ...previousRequest,
          status: 'DECLINED',
          reviewReason: payload.reviewReason
        });
      }
      return { previousRequest };
    },
    onSuccess: async (updatedRequest) => {
      if (updatedRequest) {
        queryClient.setQueryData(queryKeys.adminOrganizerRequests.detail(id), updatedRequest);
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminOrganizerRequests.lists() });
      toast.success('Đã từ chối hồ sơ Organizer');
    },
    onError: (error, variables, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(queryKeys.adminOrganizerRequests.detail(id), context.previousRequest);
      }
      toast.error(getErrorMessage(error));
      if (error.response?.status === 400) detailQuery.refetch();
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