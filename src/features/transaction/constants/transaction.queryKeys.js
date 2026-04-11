export const TRANSACTION_QUERY_KEYS = {
    all: ['transactions'],
    detail: (id) => [...TRANSACTION_QUERY_KEYS.all, 'detail', id],
    myDonations: (params) => {
        const baseKey = [...TRANSACTION_QUERY_KEYS.all, 'me', 'donations'];
        return params ? [...baseKey, params] : baseKey;
    },
    
    projectDonors: (projectId, params) => {
        const baseKey = [...TRANSACTION_QUERY_KEYS.all, 'project', projectId, 'donations'];
        return params ? [...baseKey, params] : baseKey;
    },
};