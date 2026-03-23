// src/features/volunteer/components/ApplyVolunteerButton.jsx
import { useState } from 'react';
import { Users } from 'lucide-react';
import { VolunteerApplicationModal } from './VolunteerApplicationModal';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const ApplyVolunteerButton = ({ projectId, projectName, className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đăng ký tình nguyện'); // Thay toast bằng alert
      navigate('/login', { state: { from: `/projects/${projectId}` } });
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full py-4 text-base font-bold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 ${className}`}
      >
        <Users className="w-5 h-5" /> Apply to Volunteer
      </button>

      <VolunteerApplicationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectId={projectId}
        projectName={projectName}
        onSuccess={() => {
          setShowModal(false);
          alert('Đăng ký thành công!'); // Thay toast bằng alert
        }}
      />
    </>
  );
};