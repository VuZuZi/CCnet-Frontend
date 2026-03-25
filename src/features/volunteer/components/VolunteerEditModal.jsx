// src/features/volunteer/components/VolunteerEditModal.jsx
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export const VolunteerEditModal = ({ isOpen, onClose, application, projectName, onUpdate, isUpdating }) => {
    // Chuyển đổi availability từ string sang array (nếu có)
    const initialAvailability = application?.availability
        ? application.availability.split(',').map(item => item.trim())
        : [];

    const [formData, setFormData] = useState({
        skills: application?.skills || '',
        availability: initialAvailability,
        motivation: application?.motivation || '',
    });

    const [errors, setErrors] = useState({});

    // Skill options
    const skillsOptions = [
        { value: 'field_planting', label: 'Làm việc theo dự án' },
        { value: 'logistics', label: 'Vận Chuyển' },
        { value: 'education', label: 'Dạy học' },
        { value: 'data', label: 'Dữ liệu' },
    ];

    // Availability options
    const availabilityOptions = [
        { value: 'full_time', label: 'Full-time', icon: 'work' },
        { value: 'part_time', label: 'Part-time', icon: 'schedule' },
        { value: 'weekends', label: 'Weekends', icon: 'weekend' },
        { value: 'flexible', label: 'Flexible', icon: 'autorenew' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Xử lý multi-select availability
    const handleAvailabilityToggle = (optionValue) => {
        setFormData(prev => {
            const newAvailability = prev.availability.includes(optionValue)
                ? prev.availability.filter(item => item !== optionValue)
                : [...prev.availability, optionValue];
            return { ...prev, availability: newAvailability };
        });

        if (errors.availability) {
            setErrors(prev => ({ ...prev, availability: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.skills) {
            newErrors.skills = 'Vui lòng chọn vị trí ứng tuyển';
        }

        if (formData.availability.length === 0) {
            newErrors.availability = 'Vui lòng chọn ít nhất một khung thời gian';
        }

        if (!formData.motivation.trim()) {
            newErrors.motivation = 'Vui lòng chia sẻ động lực tham gia';
        } else if (formData.motivation.length < 10) {
            newErrors.motivation = 'Động lực nên có ít nhất 10 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const submitData = {
            ...formData,
            availability: formData.availability.join(', '), // Chuyển array thành string
        };

        onUpdate(submitData);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000]"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-[90%] max-w-[550px] max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <p className="text-sm text-gray-500">
                                {projectName}
                            </p>
                            <h2 className="text-xl font-bold text-gray-900">
                                Chỉnh sửa đơn đăng ký
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 max-h-[calc(90vh-120px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Select Role */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                Select Role <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    className={`appearance-none bg-white border rounded-xl w-full p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 ${errors.skills
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-200'
                                        }`}
                                >
                                    <option value="" disabled>Choose a position</option>
                                    {skillsOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                            {errors.skills && (
                                <p className="text-sm text-red-500 mt-1">{errors.skills}</p>
                            )}
                        </div>

                        {/* Availability - Multi-select */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-700">
                                Availability <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Bạn có thể chọn nhiều khung thời gian
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {availabilityOptions.map((option) => {
                                    const isSelected = formData.availability.includes(option.value);
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleAvailabilityToggle(option.value)}
                                            className={`rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-2 ${isSelected
                                                ? 'border-2 border-primary text-slate-900 bg-primary/10'
                                                : 'border border-slate-200 text-slate-600 bg-white hover:border-primary hover:text-primary'
                                                }`}
                                        >
                                            {isSelected && (
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                            )}
                                            <span className="material-symbols-outlined text-sm">{option.icon}</span>
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.availability && (
                                <p className="text-sm text-red-500 mt-1">{errors.availability}</p>
                            )}
                        </div>

                        {/* Motivation Text Area */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                Why do you want to join this project? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="motivation"
                                value={formData.motivation}
                                onChange={handleChange}
                                rows="5"
                                className={`bg-white border rounded-xl w-full p-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder:text-slate-400 ${errors.motivation
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-slate-200'
                                    }`}
                                placeholder="Tell us about your motivation and relevant skills..."
                            />
                            {errors.motivation && (
                                <p className="text-sm text-red-500 mt-1">{errors.motivation}</p>
                            )}
                            <p className="text-xs text-slate-500">
                                {formData.motivation.length}/10+ characters
                            </p>
                        </div>

                        {/* Footer Buttons */}
                        <div className="border-t border-slate-100 pt-6 flex justify-end items-center gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isUpdating}
                                className="text-slate-500 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="bg-primary hover:brightness-105 active:scale-95 text-slate-900 font-bold px-8 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        Update Application
                                        <span className="material-symbols-outlined text-sm">send</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};