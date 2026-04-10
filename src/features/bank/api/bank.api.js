import httpClient from '@/shared/lib/httpClient';

export const bankAPI = {
    getAccounts: async () => {
        const response = await httpClient.get('/bank-accounts');
        return response.data?.data;
    },

    addAccount: async (payload) => {
        const response = await httpClient.post('/bank-accounts', payload);
        return response.data;
    },

    verifyAccount: async ({ id, amount }) => {
        const response = await httpClient.post(`/bank-accounts/${id}/verify`, { amount });
        return response.data;
    },
};