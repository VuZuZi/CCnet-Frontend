// import httpClient from '@/shared/lib/httpClient';

// export const volunteerAPI = {
//     // Tạo đơn đăng ký
//     createApplication: async (data) => {
//         // console.log("sssssssss" + await httpClient.post('/project/:id/aplly', data));
//         console.log("123123123" + response)
//         const response = await httpClient.post('/volunteer-applications', data);
//         console.log("2222222222222" + response)
//         return response.data?.data;

//     },

//     // Lấy danh sách đơn của tôi
//     getMyApplications: async (params) => {
//         const response = await httpClient.get('/volunteer-applications/my-applications', { params });
//         return response.data?.data;
//     }
// };

// src/features/volunteer/api/volunteerAPI.js
import httpClient from '@/shared/lib/httpClient';

export const volunteerAPI = {
    createApplication: async (data) => {
        console.log('1️⃣ volunteerAPI.createApplication called with:', data);

        try {
            // ✅ Kiểm tra httpClient có hoạt động không
            console.log('2️⃣ Calling httpClient.post...');
            const response = await httpClient.post(`/volunteer/submit`, data);
            console.log('3️⃣ Response received:', response);
            return response.data?.data;
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }
};