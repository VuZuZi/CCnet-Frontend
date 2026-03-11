import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { useToast } from '@/shared/contexts/ToastContext';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { getErrorMessage } from '@/shared/lib/httpClient';

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: userAPI.updateProfile,
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['profile', updatedUser.id] });

            useAuthStore.setState({ user: updatedUser });

            toast.success('Profile updated successfully!');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        }
    });
};