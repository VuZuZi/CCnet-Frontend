import httpClient from "../../../shared/lib/httpClient.js";

export const volunteerEngagementAPI = {
  getProjectReviews: async (projectId) => {
    const response = await httpClient.get(
      `/volunteer-engagement/projects/${projectId}/reviews`
    );
    return response?.data?.data || response?.data || [];
  },

  getMyProjectReview: async (projectId) => {
    const response = await httpClient.get(
      `/volunteer-engagement/projects/${projectId}/my-review`
    );
    return (
      response?.data?.data?.review ??
      response?.data?.review ??
      null
    );
  },

  submitReview: async ({ reviewId, score, comment }) => {
    const response = await httpClient.patch(
      `/volunteer-engagement/reviews/${reviewId}`,
      {
        score,
        comment,
      }
    );
    return response?.data?.data || response?.data;
  },
};

export default volunteerEngagementAPI;