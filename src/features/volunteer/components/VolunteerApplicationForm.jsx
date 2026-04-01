// src/features/volunteer/components/VolunteerApplicationForm.jsx
import { useState } from 'react';
import { useVolunteerMutations } from '../hooks/useVolunteerMutations';

export const VolunteerApplicationForm = ({ projectId, onSuccess, onCancel }) => {
  const { createApplication, isCreating } = useVolunteerMutations();

  const [formData, setFormData] = useState({
    opportunityId: projectId,
    skills: '',
    availability: [],
    motivation: '',
  });

  const [errors, setErrors] = useState({});

  // Role options
  const skillsOptions = [
    { value: 'field_planting', label: 'Làm việc theo dự án' },
    { value: 'logistics', label: 'Vận Chuyển' },
    { value: 'education', label: 'dạy học' },
    { value: 'data', label: 'dữ liệu' },
  ];

  // Availability options
  const availabilityOptions = [
    { value: 'full_time', label: 'Full-time', icon: '' },
    { value: 'part_time', label: 'Part-time', icon: '' },
    { value: 'weekends', label: 'Weekends', icon: '' },
    { value: 'flexible', label: 'Flexible', icon: '' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
      availability: formData.availability.join(', '),
    };

    try {
      await createApplication(submitData);
      onSuccess?.();
    } catch (error) {
      console.error('Submit failed:', error);

      //  Xử lý lỗi duplicate
      if (error?.response?.status === 400 && error?.response?.data?.message?.includes('Already applied')) {
        alert('Bạn đã đăng ký dự án này rồi!');
      } else if (error?.message?.includes('E11000') || error?.response?.data?.message?.includes('duplicate')) {
        alert('Bạn đã đăng ký dự án này rồi! Vui lòng kiểm tra lại.');
      } else {
        alert('Đăng ký thất bại. Vui lòng thử lại sau.');
      }
    }
  };

  return (
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

      {/* Availability */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-slate-700">
          Availability <span className="text-red-500">*</span>
        </label>
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
                  <span className="material-symbols-outlined text-sm">Làm</span>
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
          {formData.motivation.length}/50+ characters
        </p>
      </div>

      {/* Footer Buttons */}
      <div className="border-t border-slate-100 pt-6 flex justify-end items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="text-slate-500 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isCreating}
          className="bg-primary hover:brightness-105 active:scale-95 text-slate-900 font-bold px-8
           py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>

              <span className="material-symbols-outlined text-sm">Submit Application</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
