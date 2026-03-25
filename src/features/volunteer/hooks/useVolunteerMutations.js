// src/features/volunteer/hooks/useVolunteerMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { volunteerAPI } from '../api/volunteerAPI';

export const useVolunteerMutations = () => {
    const queryClient = useQueryClient();

    // Tạo mới application
    const createApplication = useMutation({
        mutationFn: (data) => volunteerAPI.createApplication(data),
        onSuccess: () => {
            // Invalidate queries để refresh dữ liệu
            queryClient.invalidateQueries({ queryKey: ['volunteer-application'] });
        },
        onError: (error) => {
            console.error('Error creating application:', error);
        }
    });

    // ✅ UPDATE application
    const updateApplication = useMutation({
        mutationFn: ({ id, data }) => volunteerAPI.updateApplication(id, data),
        onSuccess: (data, variables) => {
            console.log('✅ Update success:', data);
            // Invalidate queries để refresh dữ liệu
            queryClient.invalidateQueries({ queryKey: ['volunteer-application'] });
            // Có thể update cache trực tiếp
            queryClient.setQueryData(['volunteer-application', variables.id], data);
        },
        onError: (error) => {
            console.error('❌ Error updating application:', error);
        }
    });

    // ✅ HỦY application
    const cancelApplication = useMutation({
        mutationFn: (id) => volunteerAPI.cancelApplication(id),
        onSuccess: () => {
            console.log('✅ Cancel success');
            // Invalidate queries để refresh dữ liệu
            queryClient.invalidateQueries({ queryKey: ['volunteer-application'] });
        },
        onError: (error) => {
            console.error('❌ Error cancelling application:', error);
        }
    });

    return {
        createApplication: createApplication.mutateAsync,
        isCreating: createApplication.isPending,

        updateApplication: updateApplication.mutateAsync,
        isUpdating: updateApplication.isPending,

        cancelApplication: cancelApplication.mutateAsync,
        isCancelling: cancelApplication.isPending,
    };
};