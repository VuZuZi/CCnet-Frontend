// src/features/volunteer/api/volunteerAPI.js
import httpClient from '@/shared/lib/httpClient';

export const volunteerAPI = {
    // API để lấy application của user cho project
    getApplicationByProject: async () => {
        try {
            const response = await httpClient.get(`/volunteer/application`);
            return response.data?.data;
        } catch (error) {
            // Nếu 404 (chưa có đơn) thì trả về null
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