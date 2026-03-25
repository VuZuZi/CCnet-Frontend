
import httpClient from '@/shared/lib/httpClient';

export const volunteerAPI = {
    // createApplication: async (data) => {
    //     console.log('1️⃣ volunteerAPI.createApplication called with:', data);

    //     try {
    //         // ✅ Kiểm tra httpClient có hoạt động không
    //         console.log('2️⃣ Calling httpClient.post...');
    //         const response = await httpClient.post(`/volunteer/submit`, data);
    //         console.log('3️⃣ Response received:', response);
    //         return response.data?.data;
    //     } catch (error) {
    //         console.error('❌ API Error:', error);
    //         throw error;
    //     }
    // }
    apply: async (applicationData) => {
        const response = await apiClient.post('/volunteer-applications', applicationData);
        return response.data;
    },

    getApplications: async (projectId) => {
        const response = await apiClient.get(`/projects/${projectId}/applications`);
        return response.data;
    },

    cancelApplication: async (applicationId) => {
        const response = await apiClient.delete(`/volunteer-applications/${applicationId}`);
        return response.data;
    }
};