import httpClient from '@/shared/lib/httpClient';

export const suspenseAPI = {
    submitClaim: async (payload) => {
        const response = await httpClient.post('/transactions/suspense/claim', payload);
        return response.data;
    },

    getSuspenseList: async (params) => {
        const response = await httpClient.get('/transactions/suspense', { params });
        return response.data.data;
    },

    approveClaim: async ({ id, payload }) => {
        const response = await httpClient.post(`/transactions/suspense/${id}/approve`, payload);
        return response.data;
    }
};