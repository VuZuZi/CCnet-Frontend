export const BANK_QUERY_KEYS = {
    all: ['bank-accounts'],
    list: () => [...BANK_QUERY_KEYS.all, 'list'],
};