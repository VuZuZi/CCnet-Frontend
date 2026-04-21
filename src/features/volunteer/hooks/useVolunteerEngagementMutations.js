import { useMutation, useQueryClient } from "@tanstack/react-query";
import { volunteerEngagementAPI } from "../api/volunteerEngagementAPI";
import { volunteerEngagementQueryKeys } from "./useVolunteerEngagementQueries";

export const useVolunteerEngagementMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = async (projectId, milestoneId) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: volunteerEngagementQueryKeys.attendance(projectId, milestoneId),
      }),
      queryClient.invalidateQueries({
        queryKey: volunteerEngagementQueryKeys.reviews(projectId, milestoneId),
      }),
    ]);
  };

  const bootstrapAttendanceMutation = useMutation({
    mutationFn: ({ projectId, milestoneId }) =>
      volunteerEngagementAPI.bootstrapAttendance(projectId, milestoneId),
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ attendanceId, payload }) =>
      volunteerEngagementAPI.updateAttendance(attendanceId, payload),
  });

  const bootstrapReviewsMutation = useMutation({
    mutationFn: ({ projectId, milestoneId }) =>
      volunteerEngagementAPI.bootstrapReviews(projectId, milestoneId),
  });

  const submitReviewMutation = useMutation({
    mutationFn: ({ reviewId, payload }) =>
      volunteerEngagementAPI.submitReview(reviewId, payload),
  });

  return {
    bootstrapAttendance: async (projectId, milestoneId) => {
      const result = await bootstrapAttendanceMutation.mutateAsync({ projectId, milestoneId });
      await invalidate(projectId, milestoneId);
      return result;
    },
    updateAttendance: async (projectId, milestoneId, attendanceId, payload) => {
      const result = await updateAttendanceMutation.mutateAsync({ attendanceId, payload });
      await invalidate(projectId, milestoneId);
      return result;
    },
    bootstrapReviews: async (projectId, milestoneId) => {
      const result = await bootstrapReviewsMutation.mutateAsync({ projectId, milestoneId });
      await invalidate(projectId, milestoneId);
      return result;
    },
    submitReview: async (projectId, milestoneId, reviewId, payload) => {
      const result = await submitReviewMutation.mutateAsync({ reviewId, payload });
      await invalidate(projectId, milestoneId);
      return result;
    },

    isBootstrappingAttendance: bootstrapAttendanceMutation.isPending,
    isUpdatingAttendance: updateAttendanceMutation.isPending,
    isBootstrappingReviews: bootstrapReviewsMutation.isPending,
    isSubmittingReview: submitReviewMutation.isPending,
  };
};

export default useVolunteerEngagementMutations;