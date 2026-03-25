// src/features/volunteer/hooks/useVolunteerMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { volunteerAPI } from '../api/volunteerAPI';

export const useVolunteerMutations = () => {
    console.log('📤 ssssuseVolunteerMutations');

    const queryClient = useQueryClient();

    const createApplicationMutation = useMutation({
        mutationFn: async (data) => {
            console.log('🔄 [Mutation] mutationFn called with:', data);
            const result = await volunteerAPI.createApplication(data);
            console.log('🔄 [Mutation] API result:', result);
            return result;
        },
        onSuccess: (data) => {
            console.log('✅ [Mutation] onSuccess:', data);
            queryClient.invalidateQueries(['my-applications']);
        },
        onError: (error) => {
            console.error('❌ [Mutation] onError:', error);
        }
    });

    return {
        createApplication: createApplicationMutation.mutateAsync,
        createApplicationAsync: createApplicationMutation.mutateAsync,
        createApplicationSync: createApplicationMutation.mutate,
        isCreating: createApplicationMutation.isLoading,
        createError: createApplicationMutation.error
    };
};