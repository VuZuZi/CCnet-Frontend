import httpClient from "@/shared/lib/httpClient";

const unwrap = (response) => response?.data?.data;

export const volunteerEngagementAPI = {
  async getAttendanceList(projectId, milestoneId) {
    const response = await httpClient.get(
      `/volunteer-engagement/projects/${projectId}/milestones/${milestoneId}/attendance`
    );
    return unwrap(response);
  },

  async bootstrapAttendance(projectId, milestoneId) {
    const response = await httpClient.post(
      `/volunteer-engagement/projects/${projectId}/milestones/${milestoneId}/attendance/bootstrap`
    );
    return unwrap(response);
  },

  async updateAttendance(attendanceId, payload) {
    const response = await httpClient.patch(
      `/volunteer-engagement/attendance/${attendanceId}`,
      payload
    );
    return unwrap(response);
  },

  async getReviewList(projectId, milestoneId) {
    const response = await httpClient.get(
      `/volunteer-engagement/projects/${projectId}/milestones/${milestoneId}/reviews`
    );
    return unwrap(response);
  },

  async bootstrapReviews(projectId, milestoneId) {
    const response = await httpClient.post(
      `/volunteer-engagement/projects/${projectId}/milestones/${milestoneId}/reviews/bootstrap`
    );
    return unwrap(response);
  },

  async submitReview(reviewId, payload) {
    const response = await httpClient.patch(
      `/volunteer-engagement/reviews/${reviewId}`,
      payload
    );
    return unwrap(response);
  },
};

export default volunteerEngagementAPI;