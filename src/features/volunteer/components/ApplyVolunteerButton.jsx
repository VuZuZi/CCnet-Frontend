// src/features/volunteer/components/ApplyVolunteerButton.jsx
import { useState } from 'react';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { VolunteerApplicationModal } from './VolunteerApplicationModal';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { volunteerAPI } from '../api/volunteerAPI';

export const ApplyVolunteerButton = ({ projectId, projectName, className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch application status nếu đã đăng nhập
  const { data: application, isLoading } = useQuery({
    queryKey: ['volunteer-application', projectId, user?.id],
    queryFn: () => volunteerAPI.getApplicationByProject(projectId),
    enabled: !!isAuthenticated && !!user?.id,
    retry: false,
  });

  const hasApplied = !!application;
  const applicationStatus = application?.status;
  console.log("----------" + applicationStatus);

  const getStatusConfig = () => {
    switch (applicationStatus) {
      case 'pending':
        return {
          text: 'Đang chờ xét duyệt',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 cursor-default',
          disabled: true
        };
      case 'approved':
        return {
          text: 'Đã được chấp nhận',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 hover:bg-green-100 cursor-default',
          disabled: true
        };
      case 'rejected':
        return {
          text: 'Đã bị từ chối',
          icon: XCircle,
          className: 'bg-red-100 text-red-700 hover:bg-red-100',
          disabled: false
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  const handleClick = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đăng ký tình nguyện');
      navigate('/login', { state: { from: `/projects/${projectId}` } });
      return;
    }

    // Nếu đã có đơn đang pending hoặc approved, không cho mở modal
    if (hasApplied && (applicationStatus === 'pending' || applicationStatus === 'approved')) {
      return;
    }

    setShowModal(true);
  };

  // Nếu đang loading, hiển thị nút loading
  if (isLoading) {
    return (
      <button
        disabled
        className={`w-full py-4 text-base font-bold text-gray-400 bg-gray-100 rounded-2xl flex justify-center items-center gap-2 ${className}`}
      >
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Đang kiểm tra...
      </button>
    );
  }

  // Nếu đã có đơn, hiển thị nút trạng thái
  console.log("vooooooooooooooooo" + hasApplied, statusConfig);

  if (hasApplied && statusConfig) {
    console.log("vooooooooooooooooo");

    const StatusIcon = statusConfig.icon;
    return (
      <button
        disabled={statusConfig.disabled}
        onClick={statusConfig.disabled ? undefined : handleClick}
        className={`w-full py-4 text-base font-bold rounded-2xl flex justify-center items-center gap-2 ${statusConfig.className} ${className}`}
      >
        <StatusIcon className="w-5 h-5" />
        {statusConfig.text}
        {applicationStatus === 'rejected' && (
          <span className="text-xs ml-1">(Đăng ký lại)</span>
        )}
      </button>
    );
  }

  // Nếu chưa có đơn, hiển thị nút đăng ký bình thường
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
        user={user}
        onSuccess={() => {
          setShowModal(false);
          alert('Đăng ký thành công!');
          // Refresh dữ liệu application
          window.location.reload(); // Hoặc dùng queryClient.invalidateQueries
        }}
      />
    </>
  );
};