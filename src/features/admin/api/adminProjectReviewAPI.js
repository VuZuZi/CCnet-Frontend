import httpClient from "@/shared/lib/httpClient";

export const adminProjectReviewAPI = {
  getReview: (projectId) => httpClient.get(`/admin/projects/${projectId}/review`),
  getAIReviewRuns: (projectId) =>
    httpClient.get(`/admin/projects/${projectId}/ai-review-runs`),
  getLatestAIReviewRun: (projectId) =>
    httpClient.get(`/admin/projects/${projectId}/ai-review-runs/latest`),
  retryAIReviewRun: (projectId) =>
    httpClient.post(`/admin/projects/${projectId}/ai-review-runs/retry`),
  getReviewRecords: (projectId) =>
    httpClient.get(`/admin/projects/${projectId}/review-records`),
  decide: (projectId, payload) =>
    httpClient.post(`/admin/projects/${projectId}/decision`, payload),
};

export default adminProjectReviewAPI;
