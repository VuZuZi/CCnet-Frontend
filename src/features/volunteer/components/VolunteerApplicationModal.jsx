// src/features/volunteer/components/VolunteerApplicationModal.jsx
import React, { useEffect } from 'react';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { VolunteerApplicationForm } from './VolunteerApplicationForm';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export const VolunteerApplicationModal = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess
}) => {
  // Gọi hook bên trong component để lấy user
  const user = useAuthStore((state) => state.user);
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
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
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
                Đăng ký tình nguyện viên
              </h2>
            </div>
          </div>
        </div>

        {/* Applicant Profile Section */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Applicant Profile
          </h2>
          <div className="bg-slate-50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-200 text-amber-700 font-bold text-xl">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 font-bold">
                    {user?.fullName || user?.name || 'Guest User'}
                  </span>
                  {user?.isVerified && (
                    <BadgeCheck size={16} className="text-blue-500" title="Verified" />
                  )}
                </div>
                <span className="text-slate-500 text-sm">
                  {user?.email || 'user@example.com'}
                </span>
              </div>
            </div>
            <div className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-md font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              Trust Score: {user?.trustScore || 850}
            </div>
          </div>
        </div>

        {/* Content - Form */}
        <div className="px-6 py-5 max-h-[calc(90vh-200px)] overflow-y-auto">
          <VolunteerApplicationForm
            projectId={projectId}
            user={user}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
