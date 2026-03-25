// src/features/volunteer/components/VolunteerEditModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

export const VolunteerEditModal = ({ isOpen, onClose, application, projectName, onUpdate, isUpdating }) => {
    const [formData, setFormData] = useState({
        skills: application?.skills || '',
        availability: application?.availability || '',
        motivation: application?.motivation || '',
    });
    const [errors, setErrors] = useState({});

    const skillsOptions = [
        { value: 'field_planting', label: 'Làm việc theo dự án' },
        { value: 'logistics', label: 'Vận Chuyển' },
        { value: 'education', label: 'Dạy học' },
        { value: 'data', label: 'Dữ liệu' },
    ];

    const availabilityOptions = [
        { value: 'full_time', label: 'Full-time' },
        { value: 'part_time', label: 'Part-time' },
        { value: 'weekends', label: 'Weekends' },
        { value: 'flexible', label: 'Flexible' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAvailabilityChange = (value) => {
        setFormData(prev => ({ ...prev, availability: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.skills) newErrors.skills = 'Vui lòng chọn kỹ năng';
        if (!formData.availability) newErrors.availability = 'Vui lòng chọn thời gian';
        if (!formData.motivation.trim()) newErrors.motivation = 'Vui lòng nhập động lực';
        else if (formData.motivation.length < 10) newErrors.motivation = 'Động lực cần ít nhất 10 ký tự';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onUpdate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" onClick={onClose}>
            <div className="bg-white rounded-2xl w-[90%] max-w-[550px] max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{projectName}</p>
                            <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa đơn đăng ký</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="px-6 py-5 max-h-[calc(90vh-120px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Skills */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Kỹ năng <span className="text-red-500">*</span></label>
                            <select
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="">Chọn kỹ năng</option>
                                {skillsOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.skills && <p className="text-sm text-red-500">{errors.skills}</p>}
                        </div>

                        {/* Availability */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Thời gian <span className="text-red-500">*</span></label>
                            <select
                                value={formData.availability}
                                onChange={(e) => handleAvailabilityChange(e.target.value)}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="">Chọn thời gian</option>
                                {availabilityOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.availability && <p className="text-sm text-red-500">{errors.availability}</p>}
                        </div>

                        {/* Motivation */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Động lực <span className="text-red-500">*</span></label>
                            <textarea
                                name="motivation"
                                value={formData.motivation}
                                onChange={handleChange}
                                rows="5"
                                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Chia sẻ động lực của bạn..."
                            />
                            {errors.motivation && <p className="text-sm text-red-500">{errors.motivation}</p>}
                            <p className="text-xs text-slate-500">{formData.motivation.length}/10+ ký tự</p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border rounded-lg font-medium hover:bg-gray-50">
                                Hủy
                            </button>
                            <button type="submit" disabled={isUpdating} className="flex-1 px-4 py-2.5 bg-primary text-slate-900 rounded-lg font-medium hover:brightness-105 disabled:opacity-50">
                                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};