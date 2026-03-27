// src/features/volunteer/hooks/useQueries.js
import { useQuery } from '@tanstack/react-query';
import { volunteerAPI } from '../api/volunteerAPI';

export const useVolunteerQueries = () => {

    // 1. Lấy danh sách đơn đang chờ của project
    const useProjectPendingApplications = (projectId) => {
        return useQuery({
            queryKey: ['pending-applications', projectId],
            queryFn: () => volunteerAPI.getProjectPendingApplications(projectId),
            enabled: !!projectId,  // Chỉ chạy khi có projectId
        });
    };

    // 2. Lấy trạng thái đơn của user cho project
    const useApplicationStatus = (projectId, userId) => {
        return useQuery({
            queryKey: ['application-status', projectId, userId],
            queryFn: () => volunteerAPI.getApplicationStatus(projectId),
            enabled: !!projectId && !!userId,
        });
    };

    // 3. Lấy danh sách đơn của user
    const useMyApplications = (userId, options = {}) => {
        return useQuery({
            queryKey: ['my-applications', userId, options],
            queryFn: () => volunteerAPI.getMyApplications(userId, options),
            enabled: !!userId,
        });
    };

    // 4. Lấy chi tiết 1 đơn
    const useApplicationDetail = (applicationId) => {
        return useQuery({
            queryKey: ['application-detail', applicationId],
            queryFn: () => volunteerAPI.getApplicationById(applicationId),
            enabled: !!applicationId,
        });;
}

    return {
        useProjectPendingApplications,
        useApplicationStatus,
        useMyApplications,
        useApplicationDetail,
    };
};