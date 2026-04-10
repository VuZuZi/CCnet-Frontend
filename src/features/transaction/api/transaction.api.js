import httpClient from '@/shared/lib/httpClient';

export const transactionAPI = {
    donate: async (payload) => {
        const response = await httpClient.post('/transactions/donate', payload);
        return response.data;
    },

    withdraw: async (payload) => {
        const response = await httpClient.post('/transactions/withdraw', payload);
        return response.data;
    },

    refund: async ({ id, reason }) => {
        const response = await httpClient.post(`/transactions/${id}/refund`, { reason });
        return response.data;
    }
};