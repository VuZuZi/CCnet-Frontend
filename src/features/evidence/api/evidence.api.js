import httpClient from "@/shared/lib/httpClient";

const BASE_PATH = '/milestone-evidence';

export const evidenceAPI = {
    getPublicEvidence: async (projectId, milestoneId) => {
        const { data } = await httpClient.get(`${BASE_PATH}/public/${projectId}/${milestoneId}`);
        return data.data?.evidence || data.data;
    },
    getMyEvidence: async (params) => {
        const { data } = await httpClient.get(`${BASE_PATH}/my-evidence`, { params });
        return data.data;
    },
    getEvidenceDetail: async (id) => {
        const { data } = await httpClient.get(`${BASE_PATH}/${id}`);
        return data.data?.evidence || data.data;
    },
    submitEvidence: async (payload) => {
        const { data } = await httpClient.post(`${BASE_PATH}`, payload);
        return data.data?.evidence || data.data;
    },
    
    updateEvidence: async (id, payload) => {
        const { data } = await httpClient.patch(`${BASE_PATH}/${id}`, payload);
        return data.data?.evidence || data.data;
    },

    reviewEvidence: async (id, payload) => {
        const { data } = await httpClient.patch(`${BASE_PATH}/${id}/review`, payload);
        return data.data?.evidence || data.data;
    },
    getAdminEvidenceList: async (params) => {
        const { data } = await httpClient.get(`/admin/evidences`, { params });
        return data.data;
    }
};