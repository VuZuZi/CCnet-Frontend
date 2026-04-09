// src/features/volunteer/components/ApplyVolunteerButton.jsx
import { useState } from 'react';
import { Users, CheckCircle, Clock, XCircle, Trash2, X, Edit2 } from 'lucide-react';
import { VolunteerApplicationModal } from './VolunteerApplicationModal';
import { VolunteerEditModal } from './VolunteerEditModal';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { volunteerAPI } from '../api/volunteerAPI';
import { useToast } from '@/shared/contexts/ToastContext';

export const ApplyVolunteerButton = ({ projectId, projectName, className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch application status
  const { data: application, isLoading, refetch } = useQuery({
    queryKey: ['volunteer-application', projectId, user?.id],
    queryFn: async () => {
      const result = await volunteerAPI.getApplicationByProject(projectId);
      return result;
    },
    enabled: !!isAuthenticated && !!user?.id,
  });

  // Mutation để hủy đơn
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return await volunteerAPI.cancelApplication(application?.id);
    },
    onSuccess: () => {
      toast.success('Đã hủy đơn đăng ký thành công');
      setShowCancelConfirm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Hủy đơn thất bại. Vui lòng thử lại.',
      );
    }
  });

  // Mutation để cập nhật đơn
  const updateMutation = useMutation({
    mutationFn: async (updateData) => {
      return await volunteerAPI.updateApplication(application?.id, updateData);
    },
    onSuccess: () => {
      toast.success('Cập nhật đơn đăng ký thành công');
      setShowEditModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Cập nhật thất bại. Vui lòng thử lại.',
      );
    }
  });

  const hasApplied = Boolean(application?.id || application?._id);
  const applicationStatus = hasApplied
    ? String(application?.status || '').toUpperCase()
    : 'NONE';

  const getStatusConfig = () => {
    switch (applicationStatus) {
      case 'PENDING':
        return {
          text: 'Đang chờ xét duyệt',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
          disabled: false,
          showCancel: true,
          showEdit: true  // ✅ Cho phép chỉnh sửa
        };
      case 'APPROVED':
        return {
          text: 'Đã được chấp nhận',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 hover:bg-green-100 cursor-default',
          disabled: true,
          showCancel: false,
          showEdit: false
        };
      case 'REJECTED':
        return {
          text: 'Đã bị từ chối',
          icon: XCircle,
          className: 'bg-red-100 text-red-700 hover:bg-red-100',
          disabled: false,
          showCancel: false,
          showEdit: true
        };
      case 'CANCELLED':
        return {
          text: 'Đơn đã hủy',
          icon: XCircle,
          className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
          disabled: false,
          showCancel: false,
          showEdit: false
        };
      default:
        return {
          text: 'Đơn đăng ký đang xử lý',
          icon: Clock,
          className: 'bg-slate-100 text-slate-700 cursor-default',
          disabled: true,
          showCancel: false,
          showEdit: false
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đăng ký tình nguyện');
      navigate('/login', { state: { from: `/projects/${projectId}` } });
      return;
    }


    // ✅ Kiểm tra nếu đã có đơn
    if (hasApplied && applicationStatus === 'PENDING') {
      toast.info('Bạn đã có đơn đăng ký đang chờ xét duyệt');
      return;
    }

    if (hasApplied && applicationStatus === 'APPROVED') {
      toast.success('Bạn đã được chấp nhận tham gia dự án này');
      return;
    }

    // Nếu đơn bị từ chối, cho phép đăng ký lại
    if (hasApplied && applicationStatus === 'REJECTED') {
      // Cho phép tạo mới - cần xóa đơn cũ hoặc cho phép tạo mới
      setShowModal(true);
      return;
    }

    // Nếu đơn đã bị hủy, cho phép đăng ký lại
    if (hasApplied && applicationStatus === 'CANCELLED') {
      setShowModal(true);
      return;
    }

    setShowModal(true);
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    if (!application?.id) {
      toast.error('Không tìm thấy đơn đăng ký');
      return;
    }
    setShowCancelConfirm(true);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (!application?.id) {
      toast.error('Không tìm thấy đơn đăng ký');
      return;
    }
    setShowEditModal(true);
  };

  const handleConfirmCancel = () => {
    cancelMutation.mutate();
  };

  const handleUpdate = (updateData) => {
    updateMutation.mutate(updateData);
  };

  // Nếu đang loading
  if (isLoading) {
    return (
      <>
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

        {showCancelConfirm && (
          <CancelConfirmModal
            onClose={() => setShowCancelConfirm(false)}
            onConfirm={handleConfirmCancel}
            isPending={cancelMutation.isPending}
          />
        )}
      </>
    );
  }

  // Nếu đã có đơn
  if (hasApplied && statusConfig) {
    const StatusIcon = statusConfig.icon;
    return (
      <>
        <div className="flex flex-col gap-2">
          <button
            disabled={statusConfig.disabled}
            onClick={statusConfig.disabled ? undefined : handleClick}
            className={`w-full py-4 text-base font-bold rounded-2xl flex justify-center items-center gap-2 ${statusConfig.className} ${className}`}
          >
            <StatusIcon className="w-5 h-5" />
            {statusConfig.text}
            {applicationStatus === 'REJECTED' && (
              <span className="text-xs ml-1">(Đăng ký lại)</span>
            )}
          </button>

          {/* Action Buttons Row */}
          <div className="flex gap-2">
            {/* Nút chỉnh sửa */}
            {statusConfig.showEdit && (
              <button
                onClick={handleEditClick}
                disabled={updateMutation.isPending}
                className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex justify-center items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            )}

            {/* Nút hủy đơn */}
            {statusConfig.showCancel && (
              <button
                onClick={handleCancelClick}
                disabled={cancelMutation.isPending}
                className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex justify-center items-center gap-2"
              >
                {cancelMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Hủy đơn
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <VolunteerEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            application={application}
            projectName={projectName}
            onUpdate={handleUpdate}
            isUpdating={updateMutation.isPending}
          />
        )}

        {/* Cancel Confirm Modal */}
        {showCancelConfirm && (
          <CancelConfirmModal
            onClose={() => setShowCancelConfirm(false)}
            onConfirm={handleConfirmCancel}
            isPending={cancelMutation.isPending}
          />
        )}
      </>
    );
  }

  // Nếu chưa có đơn
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
          toast.success('Đăng ký thành công!');
          refetch();
        }}
      />
    </>
  );
};

// Cancel Confirm Modal Component
const CancelConfirmModal = ({ onClose, onConfirm, isPending }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Xác nhận hủy đơn</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn hủy đơn đăng ký tình nguyện này không?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Giữ lại
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
};
