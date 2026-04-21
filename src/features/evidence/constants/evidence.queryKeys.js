export const EVIDENCE_QUERY_KEYS = {
    all: ['evidences'],
    lists: () => [...EVIDENCE_QUERY_KEYS.all, 'list'],
    list: (filters) => [...EVIDENCE_QUERY_KEYS.lists(), filters],
    details: () => [...EVIDENCE_QUERY_KEYS.all, 'detail'],
    detail: (id) => [...EVIDENCE_QUERY_KEYS.details(), id],
    public: (projectId, milestoneId) => [...EVIDENCE_QUERY_KEYS.all, 'public', projectId, milestoneId],
};