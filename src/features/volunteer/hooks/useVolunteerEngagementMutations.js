import { useMutation, useQueryClient } from "@tanstack/react-query";
import { volunteerEngagementAPI } from "../api/volunteerEngagementAPI.js";
import { volunteerEngagementQueryKeys } from "./useVolunteerEngagementQueries.js";

export const useVolunteerEngagementMutations = () => {
  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation({
    mutationFn: volunteerEngagementAPI.submitReview,
    onSuccess: (data) => {
      const projectId =
        data?.projectId?._id || data?.projectId?.id || data?.projectId;

      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: volunteerEngagementQueryKeys.projectReviews(projectId),
        });
      }
    },
  });

  return {
    submitReview: submitReviewMutation.mutateAsync,
    isSubmittingReview: submitReviewMutation.isPending,
  };
};