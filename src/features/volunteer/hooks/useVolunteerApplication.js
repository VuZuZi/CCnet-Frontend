// src/features/project/hooks/useVolunteerApplication.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { volunteerAPI } from '../api/volunteerAPI';
import VolunteerApplication from '../components/VolunteerApplication';
export function useVolunteerApplication(projectId) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const submitApplication = async (formData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await volunteerApi.apply({
                projectId,
                ...formData
            });

            // Navigate to success page or show success message
            navigate(`/projects/${projectId}/application-success`);
            return response;
        } catch (err) {
            setError(err.message || 'Failed to submit application');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        submitApplication,
        isSubmitting,
        error
    };
}