import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api/userAPI';
import { useToast } from '@/shared/contexts/ToastContext';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { getErrorMessage } from '@/shared/lib/httpClient';

export const useUploadMedia = (type = 'avatar') => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const updateUser = useAuthStore((state) => state.updateUser);

    const mutationFn = type === 'avatar' ? userAPI.updateAvatar : userAPI.updateCoverPhoto;

    return useMutation({
        mutationFn,
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['profile', 'me'], updatedUser);
            queryClient.setQueryData(['profile', updatedUser.id], updatedUser);
            
            updateUser(updatedUser);

            const mediaName = type === 'avatar' ? 'Ảnh đại diện' : 'Ảnh bìa';
            toast.success(`Đã cập nhật ${mediaName.toLowerCase()} thành công!`);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        }
    });
};
