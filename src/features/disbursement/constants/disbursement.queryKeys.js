export const DISBURSEMENT_QUERY_KEYS = {
    all: ['disbursements'],
    lists: () => [...DISBURSEMENT_QUERY_KEYS.all, 'list'],
    list: (filters) => [...DISBURSEMENT_QUERY_KEYS.lists(), filters],
    details: () => [...DISBURSEMENT_QUERY_KEYS.all, 'detail'],
    detail: (id) => [...DISBURSEMENT_QUERY_KEYS.details(), id],
};