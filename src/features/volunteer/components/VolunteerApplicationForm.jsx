// src/features/volunteer/components/VolunteerApplicationForm.jsx
import React, { useState } from 'react';
import { useVolunteerMutations } from '../hooks/useVolunteerMutations';

export const VolunteerApplicationForm = ({ projectId, onSuccess, onCancel }) => {
  const { createApplication, isCreating } = useVolunteerMutations();

  const [formData, setFormData] = useState({
    opportunityId: projectId,
    skills: '',
    motivation: '',
    availability: [], // Thay đổi thành array để lưu nhiều lựa chọn
  });

  const [errors, setErrors] = useState({});

  // Các tùy chọn availability
  const availabilityOptions = [
    { value: 'weekend', label: 'Cuối tuần (Thứ 7 - Chủ nhật)', icon: '🌙' },
    { value: 'saturday', label: 'Thứ 7', icon: '📅' },
    { value: 'sunday', label: 'Chủ nhật', icon: '☀️' },
    { value: 'evening_weekdays', label: 'Buổi tối các ngày trong tuần (Thứ 2 - Thứ 6)', icon: '🌃' },
    { value: 'full_week', label: 'Full tuần (Linh hoạt tất cả các ngày)', icon: '📆' },
    { value: 'flexible', label: 'Linh hoạt theo lịch', icon: '🔄' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Xử lý chọn availability (checkbox)
  const handleAvailabilityChange = (optionValue) => {
    setFormData(prev => {
      const newAvailability = prev.availability.includes(optionValue)
        ? prev.availability.filter(item => item !== optionValue)
        : [...prev.availability, optionValue];

      return { ...prev, availability: newAvailability };
    });

    // Clear error khi có chọn
    if (errors.availability) {
      setErrors(prev => ({ ...prev, availability: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.skills.trim()) {
      newErrors.skills = 'Vui lòng nhập kỹ năng của bạn';
    }

    if (!formData.motivation.trim()) {
      newErrors.motivation = 'Vui lòng chia sẻ động lực tham gia';
    } else if (formData.motivation.length < 20) {
      newErrors.motivation = 'Động lực nên có ít nhất 20 ký tự';
    }

    if (formData.availability.length === 0) {
      newErrors.availability = 'Vui lòng chọn ít nhất một khung thời gian có thể tham gia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log("handleSubmit form 73");

    e.preventDefault();
    console.log("handleSubmit form 7");

    if (!validate()) return;
    console.log("handleSubmit form 79");

    // Chuyển đổi availability array thành string để gửi lên API
    const submitData = {
      ...formData,
      availability: formData.availability.join(', ')
    };
    console.log("handleSubmit form 86");

    try {
      await createApplication(submitData);
      onSuccess?.();
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Đăng ký thất bại: ' + (error.response?.data?.message || 'Vui lòng thử lại sau'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Skills Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Kỹ năng của bạn <span className="text-red-500">*</span>
        </label>
        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          rows="3"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${errors.skills
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-purple-500'
            }`}
          placeholder="Ví dụ: Giao tiếp tốt, Làm việc nhóm, Thiết kế đồ họa, Viết nội dung..."
        />
        {errors.skills && (
          <p className="text-sm text-red-500 mt-1">{errors.skills}</p>
        )}
        <p className="text-xs text-gray-500">
          Liệt kê các kỹ năng bạn có thể đóng góp cho dự án
        </p>
      </div>

      {/* Motivation Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Động lực tham gia <span className="text-red-500">*</span>
        </label>
        <textarea
          name="motivation"
          value={formData.motivation}
          onChange={handleChange}
          rows="5"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${errors.motivation
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-purple-500'
            }`}
          placeholder="Tại sao bạn muốn tham gia dự án này? Hãy chia sẻ thật chân thành để tăng cơ hội được chọn."
        />
        {errors.motivation && (
          <p className="text-sm text-red-500 mt-1">{errors.motivation}</p>
        )}
      </div>

      {/* Availability Field - Checkbox Group */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Thời gian có thể tham gia <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Bạn có thể chọn nhiều khung thời gian
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availabilityOptions.map((option) => (
            <label
              key={option.value}
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-all
                ${formData.availability.includes(option.value)
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={formData.availability.includes(option.value)}
                onChange={() => handleAvailabilityChange(option.value)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </span>
            </label>
          ))}
        </div>

        {errors.availability && (
          <p className="text-sm text-red-500 mt-2">{errors.availability}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isCreating}
          className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang gửi...
            </>
          ) : (
            'Gửi đơn đăng ký'
          )}
        </button>
      </div>
    </form>
  );
};