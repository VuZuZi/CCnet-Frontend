// src/features/volunteer/hooks/useQueries.js
import { useQuery } from '@tanstack/react-query';
import { volunteerAPI } from '../api/volunteerAPI';

export const useVolunteerQueries = () => {

    //  THÊM METHOD MỚI: Lấy danh sách đơn theo project và status
    const useProjectApplications = (projectId, status = null) => {
        return useQuery({
            queryKey: ['project-applications', projectId, status],
            queryFn: async () => {
                console.log(' [HOOK] Fetching data for status:', status);
                const result = await volunteerAPI.getProjectApplications(projectId, status);
                console.log(' [HOOK] Result for status', status, ':', result);
                return result;
            },
            enabled: !!projectId,
        });
    };

    // 1. Lấy danh sách đơn đang chờ của project
    const useProjectPendingApplications = (projectId) => {
        return useQuery({
            queryKey: ['pending-applications', projectId],
            queryFn: () => volunteerAPI.getProjectPendingApplications(projectId),
            enabled: !!projectId,
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
        });
    };

    return {
        useProjectApplications,
        useProjectPendingApplications,
        useApplicationStatus,
        useMyApplications,
        useApplicationDetail,
    };
};