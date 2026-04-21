import httpClient from '@/shared/lib/httpClient';

const BASE_PATH = '/admin-finance';

export const adminFinanceAPI = {
    getSummary: async (params) => {
        const { data } = await httpClient.get(`${BASE_PATH}/summary`, { params });
        return data.data; 
    },
    getDetail: async (projectId) => {
        const { data } = await httpClient.get(`${BASE_PATH}/${projectId}/detail`);
        return data.data;
    }
};