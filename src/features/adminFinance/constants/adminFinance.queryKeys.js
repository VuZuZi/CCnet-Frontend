export const ADMIN_FINANCE_QUERY_KEYS = {
    all: ['adminFinance'],
    summaries: () => [...ADMIN_FINANCE_QUERY_KEYS.all, 'summary'],
    summary: (filters) => [...ADMIN_FINANCE_QUERY_KEYS.summaries(), filters],
    details: () => [...ADMIN_FINANCE_QUERY_KEYS.all, 'detail'],
    detail: (projectId) => [...ADMIN_FINANCE_QUERY_KEYS.details(), projectId],
};