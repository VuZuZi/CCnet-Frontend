export const ADMIN_PROJECT_REVIEW_QUERY_KEYS = {
  all: () => ["admin", "project-review"],
  detail: (projectId) => ["admin", "project-review", projectId],
  aiRuns: (projectId) => ["admin", "project-review", projectId, "ai-runs"],
  latestAiRun: (projectId) => [
    "admin",
    "project-review",
    projectId,
    "ai-runs",
    "latest",
  ],
  records: (projectId) => ["admin", "project-review", projectId, "records"],
};

export default ADMIN_PROJECT_REVIEW_QUERY_KEYS;
