export const SUSPENSE_QUERY_KEYS = {
    all: ['suspense'],
    list: (params) => {
        const baseKey = [...SUSPENSE_QUERY_KEYS.all, 'list'];
        return params ? [...baseKey, params] : baseKey;
    },
    detail: (id) => [...SUSPENSE_QUERY_KEYS.all, 'detail', id],
};