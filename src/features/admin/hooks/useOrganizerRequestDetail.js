import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/contexts/ToastContext";
import {
  organizerRequestAdminAPI,
  getErrorMessage,
} from "../api/organizerRequestAdminAPI";
import { ADMIN_QUERY_KEYS } from "../constants/admin.queryKeys";
import { queryKeys } from "@/shared/constants/queryKeys";

const verificationChecksKey = (id) => [
  "admin",
  "organizer-request",
  id,
  "verification-checks",
];

export function useOrganizerRequestDetail(id) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.organizerRequests.detail(id),
    queryFn: () => organizerRequestAdminAPI.getRequestDetail(id),
    enabled: Boolean(id),
  });

  const checksQuery = useQuery({
    queryKey: verificationChecksKey(id),
    queryFn: () => organizerRequestAdminAPI.listVerificationChecks(id),
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
        queryKey: queryKeys.organizerRequests.me(),
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
        queryKey: queryKeys.organizerRequests.me(),
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

  const runMockVerificationMutation = useMutation({
    mutationFn: () => organizerRequestAdminAPI.runMockVerification(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.organizerRequests.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: verificationChecksKey(id),
      });
      toast.success(
        "Đã chạy mô phỏng đối chiếu nội bộ. Kết quả không ảnh hưởng quyết định phê duyệt."
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
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
    verificationChecks: checksQuery.data || [],
    isLoadingChecks: checksQuery.isLoading,
    runMockVerification: runMockVerificationMutation.mutateAsync,
    isRunningMockVerification: runMockVerificationMutation.isPending,
  };
}

export default useOrganizerRequestDetail;
