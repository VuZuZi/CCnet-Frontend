export const WALLET_QUERY_KEYS = {
    all: ['wallet'],
    me: () => [...WALLET_QUERY_KEYS.all, 'me'],
    history: (filters) => [...WALLET_QUERY_KEYS.all, 'history', filters],
};