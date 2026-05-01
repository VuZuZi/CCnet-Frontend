import httpClient from '@/shared/lib/httpClient';

export const transactionAPI = {
    donate: async (payload) => {
        const response = await httpClient.post('/transactions/donate', payload);
        return response.data;
    },

    createSupportDonation: async (payload) => {
        const response = await httpClient.post('/transactions/support-donation', payload);
        return response.data;
    },

    withdraw: async (payload) => {
        const response = await httpClient.post('/transactions/withdraw', payload);
        return response.data;
    },

    refund: async ({ id, reason }) => {
        const response = await httpClient.post(`/transactions/${id}/refund`, { reason });
        return response.data;
    },

    getMyDonations: async (params) => {
        const response = await httpClient.get('/transactions/me/donations', { params });
        return response.data.data;
    },

    getProjectDonors: async (projectId, params) => {
        const response = await httpClient.get(`/transactions/project/${projectId}/donations`, { params });
        return response.data.data;
    },

    checkStatus: async (transactionId) => {
        const response = await httpClient.get(`/transactions/${transactionId}/status`);
        return response.data.data;
    }
};
