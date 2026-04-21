import { useQuery } from "@tanstack/react-query";
import { volunteerEngagementAPI } from "../api/volunteerEngagementAPI";

export const volunteerEngagementQueryKeys = {
  attendance: (projectId, milestoneId) => [
    "volunteer-engagement",
    "attendance",
    projectId,
    milestoneId,
  ],
  reviews: (projectId, milestoneId) => [
    "volunteer-engagement",
    "reviews",
    projectId,
    milestoneId,
  ],
};

export const useAttendanceList = (projectId, milestoneId) =>
  useQuery({
    queryKey: volunteerEngagementQueryKeys.attendance(projectId, milestoneId),
    queryFn: () => volunteerEngagementAPI.getAttendanceList(projectId, milestoneId),
    enabled: Boolean(projectId && milestoneId),
  });

export const useReviewList = (projectId, milestoneId) =>
  useQuery({
    queryKey: volunteerEngagementQueryKeys.reviews(projectId, milestoneId),
    queryFn: () => volunteerEngagementAPI.getReviewList(projectId, milestoneId),
    enabled: Boolean(projectId && milestoneId),
  });