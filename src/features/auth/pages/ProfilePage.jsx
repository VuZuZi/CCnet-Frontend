import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button';
import { getRoleLabel } from '@/shared/lib/roleLabels';

export function ProfilePage() {
  const user = useAuthStore(authSelectors.user);
  const { updateUser } = useAuthStore();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll, setValues } = 
    useFormValidation(
      { fullName: user.fullName, email: user.email },
      {
        fullName: [validators.required, validators.fullName],
        email: [validators.required, validators.email],
      }
    );

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setValues({ fullName: user.fullName, email: user.email });
    setIsEditing(false);
  };

  const handleSave = () => {
    if (validateAll()) {
      // TODO: Call API to update profile
      updateUser({ fullName: values.fullName });
      toast.success('Cập nhật hồ sơ thành công');
      setIsEditing(false);
    }
  };

  const renderError = (field) => (
    touched[field] && errors[field] ? (
      <p className="text-[#dc3545] text-sm mt-1 mb-0">{errors[field]}</p>
    ) : null
  );

  return (
    <div className="min-h-screen bg-off-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-black">Hồ sơ của tôi</h1>
          <p className="text-gray text-base">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-light-gray p-6 md:p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h5 className="font-bold text-lg text-black mb-0">Thông tin Cá nhân</h5>
            {!isEditing ? (
              <Button variant="outlineDark" className="!py-1.5 !px-4 !text-sm" onClick={handleEdit}>
                ✏️ Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" className="!py-1.5 !px-4 !text-sm" onClick={handleCancel}>
                  Hủy
                </Button>
                <Button variant="yellow" className="!py-1.5 !px-4 !text-sm" onClick={handleSave}>
                  💾 Lưu
                </Button>
              </div>
            )}
          </div>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Họ và Tên</label>
                <input
                  type="text"
                  value={values.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  disabled={!isEditing}
                  className={`block w-full rounded-md border py-2 px-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors disabled:bg-light-gray disabled:cursor-not-allowed disabled:opacity-70 ${
                    touched.fullName && !!errors.fullName ? 'border-[#dc3545] focus:ring-[#dc3545]' : 'border-light-gray focus:ring-yellow'
                  }`}
                />
                {renderError('fullName')}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Địa chỉ Email</label>
                <input
                  type="email"
                  value={values.email}
                  disabled
                  readOnly
                  className="block w-full rounded-md border border-light-gray bg-light-gray cursor-not-allowed opacity-70 py-2 px-3 text-black focus:outline-none"
                />
                <p className="text-gray text-xs mt-1.5 mb-0">
                  Không thể thay đổi email
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Vai trò</label>
                <input
                  type="text"
                  value={getRoleLabel(user.role)}
                  disabled
                  readOnly
                  className="block w-full rounded-md border border-light-gray bg-light-gray cursor-not-allowed opacity-70 py-2 px-3 text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1.5">ID Người dùng</label>
                <input
                  type="text"
                  value={user.userId}
                  disabled
                  readOnly
                  className="block w-full rounded-md border border-light-gray bg-light-gray cursor-not-allowed opacity-70 py-2 px-3 text-black focus:outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-light-gray p-6 md:p-8">
          <h5 className="font-bold text-lg text-black mb-6">Bảo mật</h5>
          
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <strong className="block text-black mb-1">Mật khẩu</strong>
                <p className="text-gray text-sm mb-0">Thay đổi lần cuối 30 ngày trước</p>
              </div>
              <Link
                to={ROUTES.CHANGE_PASSWORD}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Đổi Mật Khẩu
              </Link>
            </div>
          </div>

          <hr className="border-t border-light-gray my-6" />

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <strong className="block text-black mb-1">Xác thực Hai Yếu Tố</strong>
                <p className="text-gray text-sm mb-0">Thêm một lớp bảo mật</p>
              </div>
              <Button variant="outlineDark" className="!py-1.5 !px-4 !text-sm whitespace-nowrap">
                Bật 2FA
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
