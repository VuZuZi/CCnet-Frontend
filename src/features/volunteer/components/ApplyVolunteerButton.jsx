// src/features/volunteer/components/ApplyVolunteerButton.jsx
import { Users } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const ApplyVolunteerButton = ({
  projectId,
  projectName,
  opportunityId,
  project,
  user,
  className = ""
}) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đăng ký tình nguyện');
      navigate('/login', { state: { from: `/projects/${projectId}` } });
      return;
    }

    // Chuyển sang trang volunteer/:id/apply
    // Sử dụng projectId làm id
    navigate(`/volunteer/${projectId}/apply`, {
      state: {
        projectId,
        projectName,
        opportunityId,
        project,
        user
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full py-4 text-base font-bold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 ${className}`}
    >
      <Users className="w-5 h-5" /> Apply to Volunteer
    </button>
  );
};