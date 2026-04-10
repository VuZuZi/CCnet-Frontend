export const TRANSACTION_QUERY_KEYS = {
    all: ['transactions'],
    detail: (id) => [...TRANSACTION_QUERY_KEYS.all, 'detail', id],
};