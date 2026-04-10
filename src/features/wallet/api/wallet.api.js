import httpClient from '@/shared/lib/httpClient';

export const walletAPI = {
    getMe: async () => {
        const response = await httpClient.get('/wallets/me');
        return response.data?.data;
    },

    getHistory: async ({ page = 1, limit = 10 } = {}) => {
        const response = await httpClient.get('/wallets/history', {
            params: { page, limit },
        });
        return response.data?.data;
    },
};