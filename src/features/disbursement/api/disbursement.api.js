import httpClient from "@/shared/lib/httpClient";

const BASE_PATH = '/disbursement';

export const disbursementAPI = {
    getMyRequests: async (params) => {
        const { data } = await httpClient.get(`${BASE_PATH}/my-requests`, { params });
        return data.data;
    },
    getRequestDetail: async (id) => {
        const { data } = await httpClient.get(`${BASE_PATH}/${id}`, {
            params: { _t: Date.now() }
        });
        return data.data;
    },
    createRequest: async (payload) => {
        const { data } = await httpClient.post(`${BASE_PATH}`, payload);
        return data.data;
    },
    updateBankAccount: async (id, bankAccountId) => {
        const { data } = await httpClient.patch(`${BASE_PATH}/${id}/bank-account`, { bankAccountId });
        return data.data;
    },
    approveRequest: async (id, payload) => {
        const { data } = await httpClient.patch(`${BASE_PATH}/${id}/approve`, payload);
        return data.data;
    },
    confirmTransfer: async (id, payload) => {
        const { data } = await httpClient.patch(`${BASE_PATH}/${id}/transfer`, payload);
        return data.data;
    },
    failTransfer: async (id, payload) => {
        const { data } = await httpClient.patch(`${BASE_PATH}/${id}/transfer/fail`, payload);
        return data.data;
    },
    getAdminDisbursementList: async (params) => {
        const { data } = await httpClient.get(`${BASE_PATH}/admin/list`, { params });
        return data.data;
    }
};
