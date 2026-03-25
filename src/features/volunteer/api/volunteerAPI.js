// src/features/volunteer/api/volunteerAPI.js
import httpClient from '@/shared/lib/httpClient';

export const volunteerAPI = {
    // API để lấy application của user cho project

    getApplicationByProject: async (projectId) => {
        console.log('🔵 [API] getApplicationByProject called with projectId:', projectId);
        console.log('🔵 [API] projectId type:', typeof projectId);
        console.log('🔵 [API] projectId length:', projectId?.length);

        if (!projectId) {
            console.error('❌ [API] projectId is undefined or empty!');
            return null;
        }

        try {
            const url = `/volunteer/application`;
            const config = {
                params: { opportunityId: projectId }
            };
            console.log('🔵 [API] Request config:', { url, config });

            const response = await httpClient.get(url, config);
            console.log('✅ [API] Response status:', response.status);
            console.log('✅ [API] Response data:', response.data);
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
};