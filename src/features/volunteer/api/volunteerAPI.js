// src/features/volunteer/api/volunteerAPI.js
import httpClient from '@/shared/lib/httpClient';

export const volunteerAPI = {
    //  THÊM METHOD MỚI: Lấy danh sách đơn theo project và status
    getProjectApplications: async (projectId, status) => {
        if (!projectId) {
            console.error(' [API] projectId is required');
            return { data: [] };
        }
        try {
            const url = `/volunteer/projects/${projectId}/${status}`;
            const params = {};
            if (status) params.status = status;
            const response = await httpClient.get(url, { params });
            return response.data;
        } catch (error) {
            console.error(' [API] Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            if (error.response?.status === 404) {
                return { data: [] };
            }
            throw error;
        }
    },

    //  SỬA: API để lấy danh sách đơn đang chờ của project (dùng method trên)
    getProjectPendingApplications: async (projectId) => {
        return volunteerAPI.getProjectApplications(projectId, 'PENDING');
    },

    // API để lấy application của user cho project
    getApplicationByProject: async (projectId) => {
        if (!projectId) {
            console.error(' [API] projectId is undefined or empty!');
            return null;
        }
        try {
            const url = `/volunteer/application`;
            const config = {
                params: { opportunityId: projectId }
            };
            const response = await httpClient.get(url, config);
            return response.data?.data;
        } catch (error) {
            console.error(' [API] Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // API tạo application mới
    createApplication: async (data) => {
        try {
            const response = await httpClient.post(`/volunteer/submit`, data);
            return response.data?.data;
        } catch (error) {
            console.error(' API Error:', error);
            throw error;
        }
    },
    // METHOD APPROVE
    approveApplication: async (applicationId) => {
        if (!applicationId) {
            console.error(' [API] applicationId is required');
            throw new Error('Application ID is required');
        }
        try {
            const response = await httpClient.patch(`/volunteer/${applicationId}/approve`);
            return response.data?.data;
        } catch (error) {
            console.error(' [API] Approve error:', error);
            throw error;
        }
    },

    //  THÊM METHOD REJECT
    rejectApplication: async (applicationId, reason) => {
        if (!applicationId) {
            console.error(' [API] applicationId is required');
            throw new Error('Application ID is required');
        }
        try {
            const response =
                await httpClient.patch(`/volunteer/applications/${applicationId}/reject`, {
                    rejectReason: reason
                });
            return response.data?.data;
        } catch (error) {
            console.error(' [API] Reject error:', error);
            throw error;
        }
    },

    // Cập nhật application
    updateApplication: async (applicationId, data) => {
        if (!applicationId) {
            console.error(' [API] applicationId is required');
            throw new Error('Application ID is required');
        }
        try {
            const response = await httpClient.patch(`/volunteer/applications/${applicationId}`, data);
            return response.data?.data;
        } catch (error) {
            console.error(' [API] Update error:', error);
            throw error;
        }
    },

    restoreApplication: async (applicationId) => {
        try {
            const response = await httpClient.patch(`/volunteer/applications/${applicationId}/restore`);
            return response.data?.data;
        } catch (error) {
            console.error(' [API] Update error:', error);
            throw error;
        }
    },

    // Hủy đơn
    cancelApplication: async (applicationId) => {
        try {
            const response = await httpClient.patch(`/volunteer/applications/${applicationId}/cancel`);
            return response.data?.data;
        } catch (error) {
            console.error(' [API] Cancel error:', error);
            throw error;
        }
    }
};