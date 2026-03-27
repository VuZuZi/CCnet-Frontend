// src/features/volunteer/api/volunteerAPI.js
import httpClient from '@/shared/lib/httpClient';

export const volunteerAPI = {
    // ✅ SỬA: API để lấy danh sách đơn đang chờ của project
    getProjectPendingApplications: async (projectId) => {
        console.log('🔵 [API] getProjectPendingApplications called with projectId:', projectId);
        if (!projectId) {
            console.error('❌ [API] projectId is required');
            return { data: [] };
        }
        try {
            // ✅ Đúng endpoint
            const url = `/volunteer/projects/${projectId}`;
            console.log('🔵 [API] GET URL:', url);

            const response = await httpClient.get(url);
            console.log('✅ [API] Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [API] Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 404) {
                return { data: { data: [], total: 0 } };
            }
            throw error;
        }
    },

    // API để lấy application của user cho project
    getApplicationByProject: async (projectId) => {
        if (!projectId) {
            console.error('❌ [API] projectId is undefined or empty!');
            return null;
        }
        console.log('🔵 [API] getApplicationByProject called with projectId:', projectId);

        try {
            const url = `/volunteer/application`;
            const config = {
                params: { opportunityId: projectId }
            };
            console.log('🔵 [API] Request config:', { url, config });

            const response = await httpClient.get(url, config);
            console.log('✅ [API] Response:', response.data);
            return response.data?.data;
        } catch (error) {
            console.error('❌ [API] Error:', {
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
        console.log('1️⃣ volunteerAPI.createApplication called with:', data);
        try {
            const response = await httpClient.post(`/volunteer/submit`, data);
            return response.data?.data;
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    },

    // Cập nhật application
    updateApplication: async (applicationId, data) => {
        console.log('🔵 [API] updateApplication called with:', applicationId, data);
        try {
            const response = await httpClient.patch(`/volunteer/applications/${applicationId}`, data);
            return response.data?.data;
        } catch (error) {
            console.error('❌ [API] Update error:', error);
            throw error;
        }
    },

    // Hủy đơn
    cancelApplication: async (applicationId) => {
        console.log('🔵 [API] cancelApplication called with:', applicationId);
        try {
            const response = await httpClient.patch(`/volunteer/applications/${applicationId}/cancel`);
            return response.data?.data;
        } catch (error) {
            console.error('❌ [API] Cancel error:', error);
            throw error;
        }
    }
};