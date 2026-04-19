import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/shared/components/ui/Button/Button";
import { X } from "lucide-react";
import { useProfileForm } from "../../hooks/useProfileForm";
import LocationPicker from "@/shared/components/ui/LocationPicker";

export function EditProfileModal({ isOpen, onClose, user }) {
  const { form, onSubmit, isSubmitting } = useProfileForm(user, onClose);
  const {
    register,
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 id="edit-profile-title" className="text-xl font-bold text-gray-900">
            Chỉnh sửa hồ sơ
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Đóng cửa sổ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scrollbar overflow-y-auto p-6">
          <form id="edit-profile-form" onSubmit={onSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1 block text-sm font-bold text-gray-700"
              >
                Họ và tên *
              </label>
              <input
                id="fullName"
                type="text"
                {...register("fullName")}
                className={`w-full rounded-xl border p-3 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${
                  errors.fullName
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-gray-50 focus:bg-white"
                }`}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="headline"
                className="mb-1 block text-sm font-bold text-gray-700"
              >
                Tiêu đề ngắn
              </label>
              <input
                id="headline"
                type="text"
                {...register("headline")}
                className={`w-full rounded-xl border p-3 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${
                  errors.headline
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-gray-50 focus:bg-white"
                }`}
                placeholder="Người truyền cảm hứng vì cộng đồng..."
              />
              {errors.headline && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.headline.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Địa chỉ
                </label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <div
                      className={errors.location ? "rounded-xl ring-2 ring-red-200" : ""}
                    >
                      <LocationPicker
                        value={field.value}
                        onChange={field.onChange}
                        hasError={!!errors.location}
                      />
                    </div>
                  )}
                />
                {errors.location && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.location.address?.message ||
                      errors.location.coordinates?.message ||
                      errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-sm font-bold text-gray-700"
                >
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="text"
                  {...register("phone")}
                  className={`w-full rounded-xl border p-3 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${
                    errors.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus:bg-white"
                  }`}
                  placeholder="0987654321"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="skills"
                className="mb-1 block text-sm font-bold text-gray-700"
              >
                Kỹ năng
              </label>
              <input
                id="skills"
                type="text"
                {...register("skills")}
                className={`w-full rounded-xl border p-3 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${
                  errors.skills
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-gray-50 focus:bg-white"
                }`}
                placeholder="Y tế, Hậu cần, Sơ cứu"
              />
              <p className="mt-1 text-xs text-gray-400">
                Phân tách các kỹ năng bằng dấu phẩy.
              </p>
              {errors.skills && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.skills.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="about"
                className="mb-1 block text-sm font-bold text-gray-700"
              >
                Giới thiệu bản thân
              </label>
              <textarea
                id="about"
                {...register("about")}
                rows={4}
                className={`w-full resize-none rounded-xl border p-3 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${
                  errors.about
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-gray-50 focus:bg-white"
                }`}
                placeholder="Viết một chút về hành trình và đam mê của bạn..."
              />
              {errors.about && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.about.message}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50 p-6">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="edit-profile-form"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;