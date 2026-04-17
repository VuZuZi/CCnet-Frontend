export const ADMIN_QUERY_KEYS = {
  stats: () => ["admin", "stats"],

  users: {
    all: () => ["admin", "users"],
    list: (params = {}) => ["admin", "users", params],
  },

  actionLogs: {
    all: () => ["admin", "action-logs"],
    list: (params = {}) => ["admin", "action-logs", params],
  },

  projects: {
    all: () => ["admin", "projects"],
    list: (params = {}) => ["admin", "projects", params],
  },

  reports: {
    all: () => ["admin", "reports"],
    list: (params = {}) => ["admin", "reports", params],
  },

  organizerRequests: {
    all: () => ["admin", "organizer-requests"],
    list: (params = {}) => ["admin", "organizer-requests", params],
    detail: (id) => ["admin", "organizer-request", id],
  },

  organizerActionLogs: {
    all: () => ["admin", "organizer-action-logs"],
    list: (params = {}) => ["admin", "organizer-action-logs", params],
  },
};

export const ADMIN_STATS_QUERY_KEY = ADMIN_QUERY_KEYS.stats();
export const ADMIN_USERS_QUERY_KEY = ADMIN_QUERY_KEYS.users.all();
export const ADMIN_REPORTS_QUERY_KEY = ADMIN_QUERY_KEYS.reports.all();
export const ADMIN_PROJECTS_QUERY_KEY = ADMIN_QUERY_KEYS.projects.all();

export default ADMIN_QUERY_KEYS;