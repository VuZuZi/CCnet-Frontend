import { useQuery } from "@tanstack/react-query";
import { volunteerEngagementAPI } from "../api/volunteerEngagementAPI.js";

export const volunteerEngagementQueryKeys = {
  projectReviews: (projectId) => [
    "volunteer-engagement",
    "project-reviews",
    projectId,
  ],
  myProjectReview: (projectId) => [
    "volunteer-engagement",
    "my-project-review",
    projectId,
  ],
};

export const useProjectReviews = (projectId, options = {}) =>
  useQuery({
    queryKey: volunteerEngagementQueryKeys.projectReviews(projectId),
    queryFn: () => volunteerEngagementAPI.getProjectReviews(projectId),
    enabled: Boolean(projectId) && (options.enabled ?? true),
    ...options,
  });

export const useMyProjectReview = (projectId, options = {}) =>
  useQuery({
    queryKey: volunteerEngagementQueryKeys.myProjectReview(projectId),
    queryFn: async () => {
      const result = await volunteerEngagementAPI.getMyProjectReview(projectId);
      return result?.review ?? result ?? null;
    },
    enabled: Boolean(projectId) && (options.enabled ?? true),
    ...options,
  });