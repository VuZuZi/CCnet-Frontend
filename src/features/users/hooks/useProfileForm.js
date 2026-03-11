import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../validations/profileSchema';
import { useUpdateProfile } from './useUpdateProfile';

export const useProfileForm = (initialData, onSuccessCallback) => {
    const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

    const formattedInitialData = initialData ? {
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        location: initialData.location || '',
        headline: initialData.headline || '',
        about: initialData.about || '',
        skills: Array.isArray(initialData.skills) ? initialData.skills.join(', ') : '',
    } : {};

    const form = useForm({
        resolver: zodResolver(profileSchema),
        values: formattedInitialData, 
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        try {
            await updateProfile(data);
            
            if (onSuccessCallback) onSuccessCallback();
        } catch (error) {
            console.error('[ProfileForm] Submission failed:', error);
        }
    };

    return {
        form,
        onSubmit: form.handleSubmit(onSubmit),
        isSubmitting: isPending,
    };
};