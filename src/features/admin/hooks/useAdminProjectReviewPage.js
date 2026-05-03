import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/contexts/ToastContext";
import adminProjectReviewAPI from "../api/adminProjectReviewAPI";
import { ADMIN_PROJECTS_QUERY_KEY } from "../constants/admin.queryKeys";
import { ADMIN_PROJECT_REVIEW_QUERY_KEYS } from "../constants/adminProjectReview.queryKeys";

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const STALE_DECISION_MESSAGE =
  "Hồ sơ đã thay đổi hoặc đã được xử lý. Vui lòng tải lại dữ liệu trước khi quyết định.";

export function useAdminProjectReviewPage(projectId) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const reviewQuery = useQuery({
    queryKey: ADMIN_PROJECT_REVIEW_QUERY_KEYS.detail(projectId),
    queryFn: async () => unwrap(await adminProjectReviewAPI.getReview(projectId)),
    enabled: Boolean(projectId),
    staleTime: 15 * 1000,
    // Poll while an AI run is in-flight; stop automatically on terminal states.
    refetchInterval: (query) => {
      const aiStatus = query.state.data?.latestAIReviewRun?.status;
      return aiStatus === "PENDING" || aiStatus === "RUNNING" ? 5000 : false;
    },
  });

  const retryMutation = useMutation({
    mutationFn: async () =>
      unwrap(await adminProjectReviewAPI.retryAIReviewRun(projectId)),
    onSuccess: async (returnedRun) => {
      // Optimistically show the PENDING run immediately so the spinner renders
      // without waiting for the background refetch to complete.
      if (returnedRun) {
        queryClient.setQueryData(
          ADMIN_PROJECT_REVIEW_QUERY_KEYS.detail(projectId),
          (prev) => (prev ? { ...prev, latestAIReviewRun: returnedRun } : prev)
        );
      }
      // Invalidate so the query refetches fresh server state (picks up RUNNING→COMPLETED transition too).
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PROJECT_REVIEW_QUERY_KEYS.detail(projectId),
      });
      toast.success("Đã yêu cầu chạy lại báo cáo phân tích sơ bộ.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Không thể chạy lại AI."));
    },
  });

  const decisionMutation = useMutation({
    mutationFn: async (payload) =>
      unwrap(await adminProjectReviewAPI.decide(projectId, payload)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ADMIN_PROJECT_REVIEW_QUERY_KEYS.detail(projectId),
        }),
        queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY }),
      ]);
      toast.success("Đã ghi nhận quyết định kiểm duyệt.");
    },
    onError: async (error) => {
      if (error?.response?.status === 409) {
        await queryClient.invalidateQueries({
          queryKey: ADMIN_PROJECT_REVIEW_QUERY_KEYS.detail(projectId),
        });
        toast.error(STALE_DECISION_MESSAGE, 7000);
        return;
      }

      toast.error(getErrorMessage(error, "Không thể ghi nhận quyết định."));
    },
  });

  return {
    review: reviewQuery.data,
    isLoading: reviewQuery.isLoading,
    isFetching: reviewQuery.isFetching,
    error: reviewQuery.error,
    refetch: reviewQuery.refetch,
    retryAIReview: retryMutation.mutateAsync,
    isRetryingAIReview: retryMutation.isPending,
    decideProject: decisionMutation.mutateAsync,
    isDeciding: decisionMutation.isPending,
  };
}

export default useAdminProjectReviewPage;
