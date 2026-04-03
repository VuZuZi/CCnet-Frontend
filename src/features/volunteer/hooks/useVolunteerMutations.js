// src/features/volunteer/hooks/useVolunteerMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { volunteerAPI } from '../api/volunteerAPI';

export const useVolunteerMutations = () => {
    const queryClient = useQueryClient();

    // Tạo mới application
    const createApplication = useMutation({
        mutationFn: (data) => volunteerAPI.createApplication(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['volunteer-application'] });
            queryClient.invalidateQueries({ queryKey: ['project-applications'] });
        },
        onError: (error) => {
            console.error('Error creating application:', error);
        }
    });

    //  UPDATE application
    const updateApplication = useMutation({
        mutationFn: ({ id, data }) => volunteerAPI.updateApplication(id, data),
        onSuccess: (data, variables) => {
            console.log(' Update success:', data);
            queryClient.invalidateQueries({ queryKey: ['volunteer-application'] });
            queryClient.invalidateQueries({ queryKey: ['project-applications'] });
            queryClient.setQueryData(['volunteer-application', variables.id], data);
            queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
        },
        onError: (error) => {
            console.error('❌ Error updating application:', error);
        }
    });

    //  HỦY application
    const cancelApplication = useMutation({
        mutationFn: (id) => volunteerAPI.cancelApplication(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['volunteer-application'] });
            queryClient.invalidateQueries({ queryKey: ['project-applications'] });
        },
        onError: (error) => {
            console.error('❌ Error cancelling application:', error);
        }
    });

    //  APPROVE application (thêm mới)
    const approveApplication = useMutation({
        mutationFn: async (id) => {
            try {
                const result = await volunteerAPI.approveApplication(id);
                return result;
            } catch (error) {
                console.error('❌ [Mutation] API error:', error);
                console.error('❌ Error details:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    config: error.config
                });
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log(' Approve success:', data);
            queryClient.invalidateQueries({ queryKey: ['volunteer-application'] });
            queryClient.invalidateQueries({ queryKey: ['project-applications'] });
            queryClient.invalidateQueries({ queryKey: ['pending-applications'] });

        },
        onError: (error) => {
            console.error('❌ Error approving application:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
        }
    });

    //  REJECT application (thêm mới)
    const rejectApplication = useMutation({
        mutationFn: ({ id, reason }) => volunteerAPI.rejectApplication(id, reason),
        onSuccess: () => {
            console.log(' Reject success');
            queryClient.invalidateQueries({ queryKey: ['volunteer-application'] });
            queryClient.invalidateQueries({ queryKey: ['project-applications'] });
            queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
        },
        onError: (error) => {
            console.error('❌ Error rejecting application:', error);
        }
    });

    //  RESTORE application (thêm mới)
    const restoreApplication = useMutation({
        mutationFn: ({ id }) => volunteerAPI.restoreApplication(id),
        onSuccess: () => {
            console.log(' Restore success');
            queryClient.invalidateQueries({ queryKey: ['volunteer-application'] });
            queryClient.invalidateQueries({ queryKey: ['project-applications'] });
            queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
        },
        onError: (error) => {
            console.error('❌ Error restoring application:', error);
        }
    });

    return {
        // Tạo mới
        createApplication: createApplication.mutateAsync,
        isCreating: createApplication.isPending,

        // Cập nhật
        updateApplication: updateApplication.mutateAsync,
        isUpdating: updateApplication.isPending,

        // Hủy
        cancelApplication: cancelApplication.mutateAsync,
        isCancelling: cancelApplication.isPending,

        // Duyệt
        approveApplication: approveApplication.mutate,
        isApproving: approveApplication.isPending,

        // Từ chối
        rejectApplication: rejectApplication.mutate,
        isRejecting: rejectApplication.isPending,

        // Khôi phục
        restoreApplication: restoreApplication.mutate,
        isRestoring: restoreApplication.isPending,
    };
};