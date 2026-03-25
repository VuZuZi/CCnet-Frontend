// src/features/project/components/volunteer/ApplicationForm.jsx
import { useState } from 'react';
import { RoleSelect } from './RoleSelect';
import { AvailabilityButtons } from './AvailabilityButtons';
import { MotivationTextarea } from './MotivationTextarea';

export function ApplicationForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        role: '',
        availability: 'Weekends',
        motivation: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <section className="mt-10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Application Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <RoleSelect value={formData.role} onChange={(value) => handleChange('role', value)} />
                <AvailabilityButtons
                    value={formData.availability}
                    onChange={(value) => handleChange('availability', value)}
                />
                <MotivationTextarea
                    value={formData.motivation}
                    onChange={(value) => handleChange('motivation', value)}
                />
            </form>
        </section>
    );
}