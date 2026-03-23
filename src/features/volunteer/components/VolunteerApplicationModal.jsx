// src/features/volunteer/components/VolunteerApplicationModal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { VolunteerApplicationForm } from './VolunteerApplicationForm';

export const VolunteerApplicationModal = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    // VolunteerApplicationModal.jsx
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]" // Tăng lên 9999
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-[90%] max-w-[550px] max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Đăng ký tình nguyện viên
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[calc(90vh-120px)] overflow-y-auto">
          <VolunteerApplicationForm
            projectId={projectId}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};