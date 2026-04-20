import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Controller } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/shared/components/ui/Button/Button";
import { useProfileForm } from "../../hooks/useProfileForm";
import LocationPicker from "@/shared/components/ui/LocationPicker";

const NAVBAR_HEIGHT = 88;
const CONTENT_DELAY = 80;

export function EditProfileModal({ isOpen, onClose, user }) {
  const { form, onSubmit, isSubmitting } = useProfileForm(user, onClose);
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const [shouldRenderContent, setShouldRenderContent] = useState(false);

  // 🔥 Delay content mount → tránh giật khi mở modal
  useEffect(() => {
    if (!isOpen) {
      setShouldRenderContent(false);
      return;
    }

    const timer = setTimeout(() => {
      setShouldRenderContent(true);
    }, CONTENT_DELAY);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // 🔥 Lock scroll body
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalNode = (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="flex h-full justify-center overflow-y-auto px-4 pb-6 md:px-6"
        style={{ paddingTop: `${NAVBAR_HEIGHT + 16}px` }}
      >
        <div
          className="flex w-full max-w-[980px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
          style={{
            maxHeight: `calc(100dvh - ${NAVBAR_HEIGHT + 32}px)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="text-[20px] font-bold text-slate-900">
              Chỉnh sửa hồ sơ
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {!shouldRenderContent ? (
              // 🔥 Skeleton tránh giật
              <div className="space-y-4 animate-pulse">
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-[220px] rounded-2xl bg-slate-100" />
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-24 rounded-xl bg-slate-100" />
              </div>
            ) : (
              <form
                id="edit-profile-form"
                onSubmit={onSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Họ và tên *
                  </label>
                  <input
                    {...register("fullName")}
                    className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-[#FBBF24] focus:ring-4 focus:ring-[#FBBF24]/20 ${
                      errors.fullName
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 bg-slate-50 focus:bg-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Tiêu đề ngắn
                  </label>
                  <input
                    {...register("headline")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#FBBF24] focus:ring-4 focus:ring-[#FBBF24]/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_300px]">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Địa chỉ
                    </label>

                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <LocationPicker
                          value={field.value}
                          onChange={field.onChange}
                          hasError={!!errors.location}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Số điện thoại
                    </label>
                    <input
                      {...register("phone")}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#FBBF24] focus:ring-4 focus:ring-[#FBBF24]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Kỹ năng
                  </label>
                  <input
                    {...register("skills")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#FBBF24] focus:ring-4 focus:ring-[#FBBF24]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    rows={4}
                    {...register("about")}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#FBBF24] focus:ring-4 focus:ring-[#FBBF24]/20"
                  />
                </div>
              </form>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5">
            <Button variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="edit-profile-form"
              isLoading={isSubmitting}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}

export default EditProfileModal;