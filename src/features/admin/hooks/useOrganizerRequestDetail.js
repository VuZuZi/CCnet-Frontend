import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/contexts/ToastContext";
import {
  organizerRequestAdminAPI,
  getErrorMessage,
} from "../api/organizerRequestAdminAPI";
import { ADMIN_QUERY_KEYS } from "../constants/admin.queryKeys";

export function useOrganizerRequestDetail(id) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.organizerRequests.detail(id),
    queryFn: () => organizerRequestAdminAPI.getRequestDetail(id),
    enabled: Boolean(id),
  });

  const approveMutation = useMutation({
    mutationFn: (payload) => organizerRequestAdminAPI.approveRequest(id, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ADMIN_QUERY_KEYS.organizerRequests.detail(id),
      });

      const previousRequest = queryClient.getQueryData(
        ADMIN_QUERY_KEYS.organizerRequests.detail(id)
      );

      if (previousRequest) {
        queryClient.setQueryData(
          ADMIN_QUERY_KEYS.organizerRequests.detail(id),
          {
            ...previousRequest,
            status: "APPROVED",
            reviewReason: payload?.reviewReason || "",
          }
        );
      }

      return { previousRequest };
    },
    onSuccess: async (updatedRequest) => {
      if (updatedRequest) {
        queryClient.setQueryData(
          ADMIN_QUERY_KEYS.organizerRequests.detail(id),
          updatedRequest
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.organizerRequests.all(),
      });

      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.organizerActionLogs?.all?.() || [
          "admin",
          "organizer-action-logs",
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: ["organizer-request", "me"],
      });

      toast.success("Đã duyệt hồ sơ nhà tổ chức");
    },
    onError: (error, _variables, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(
          ADMIN_QUERY_KEYS.organizerRequests.detail(id),
          context.previousRequest
        );
      }

      toast.error(getErrorMessage(error));

      if (error?.response?.status === 400) {
        detailQuery.refetch();
      }
    },
  });

  const declineMutation = useMutation({
    mutationFn: (payload) => organizerRequestAdminAPI.declineRequest(id, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ADMIN_QUERY_KEYS.organizerRequests.detail(id),
      });

      const previousRequest = queryClient.getQueryData(
        ADMIN_QUERY_KEYS.organizerRequests.detail(id)
      );

      if (previousRequest) {
        queryClient.setQueryData(
          ADMIN_QUERY_KEYS.organizerRequests.detail(id),
          {
            ...previousRequest,
            status: "DECLINED",
            reviewReason: payload?.reviewReason || "",
          }
        );
      }

      return { previousRequest };
    },
    onSuccess: async (updatedRequest) => {
      if (updatedRequest) {
        queryClient.setQueryData(
          ADMIN_QUERY_KEYS.organizerRequests.detail(id),
          updatedRequest
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.organizerRequests.all(),
      });

      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.organizerActionLogs?.all?.() || [
          "admin",
          "organizer-action-logs",
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: ["organizer-request", "me"],
      });

      toast.success("Đã từ chối hồ sơ nhà tổ chức");
    },
    onError: (error, _variables, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(
          ADMIN_QUERY_KEYS.organizerRequests.detail(id),
          context.previousRequest
        );
      }

      toast.error(getErrorMessage(error));

      if (error?.response?.status === 400) {
        detailQuery.refetch();
      }
    },
  });

  return {
    request: detailQuery.data || null,
    isLoading: detailQuery.isLoading,
    isFetching: detailQuery.isFetching,
    isError: detailQuery.isError,
    error: detailQuery.error,
    approve: approveMutation.mutateAsync,
    decline: declineMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
}

export default useOrganizerRequestDetail;
