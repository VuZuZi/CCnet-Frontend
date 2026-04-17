import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Briefcase,
  ChevronDown,
  Clock3,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  X,
} from "lucide-react";

function toTitleCase(value = "") {
  return String(value)
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeRoleOption(role, index) {
  if (!role) return null;

  if (typeof role === "string") {
    const raw = role.trim();
    if (!raw) return null;

    return {
      value: raw,
      label: toTitleCase(raw),
    };
  }

  if (typeof role === "object") {
    const value =
      role.value ||
      role.code ||
      role.key ||
      role.slug ||
      role.id ||
      role.name ||
      role.title ||
      role.roleName ||
      role.role ||
      "";

    const label =
      role.label ||
      role.name ||
      role.title ||
      role.roleName ||
      role.role ||
      value ||
      "";

    const safeValue = String(value || "").trim();
    const safeLabel = String(label || "").trim();

    if (!safeValue && !safeLabel) return null;

    return {
      value: safeValue || safeLabel || `role-${index}`,
      label: safeLabel || toTitleCase(safeValue),
    };
  }

  return null;
}

function getProjectRoleOptions(project, application) {
  const rawRoles =
    project?.volunteerRoles ||
    project?.roles ||
    project?.volunteerPositions ||
    project?.neededVolunteerRoles ||
    application?.project?.volunteerRoles ||
    application?.project?.roles ||
    application?.project?.volunteerPositions ||
    application?.project?.neededVolunteerRoles ||
    application?.projectSnapshot?.volunteerRoles ||
    application?.projectSnapshot?.roles ||
    application?.projectSnapshot?.volunteerPositions ||
    application?.projectSnapshot?.neededVolunteerRoles ||
    [];

  if (!Array.isArray(rawRoles)) return [];

  const normalized = rawRoles
    .map((role, index) => normalizeRoleOption(role, index))
    .filter(Boolean);

  const seen = new Set();
  return normalized.filter((role) => {
    const key = String(role.value).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeAvailabilityValue(value) {
  if (!Array.isArray(value)) return "";
  return [...value]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .sort()
    .join("|");
}

export const VolunteerEditModal = ({
  isOpen,
  onClose,
  application,
  project,
  projectName,
  onUpdate,
  isUpdating,
}) => {
  const roleOptions = useMemo(
    () => getProjectRoleOptions(project, application),
    [project, application],
  );

  const initialAvailability = useMemo(() => {
    if (!application?.availability) return [];
    if (Array.isArray(application.availability))
      return application.availability;

    return String(application.availability)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [application]);

  const initialFormData = useMemo(
    () => ({
      skills: application?.skills || "",
      availability: initialAvailability,
      motivation: application?.motivation || "",
    }),
    [application, initialAvailability],
  );

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  const hasChanges = useMemo(() => {
    return !(
      String(formData.skills || "").trim() ===
        String(initialFormData.skills || "").trim() &&
      String(formData.motivation || "").trim() ===
        String(initialFormData.motivation || "").trim() &&
      normalizeAvailabilityValue(formData.availability) ===
        normalizeAvailabilityValue(initialFormData.availability)
    );
  }, [formData, initialFormData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(initialFormData);
    setErrors({});
  }, [isOpen, initialFormData]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isUpdating) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isUpdating, onClose]);

  const availabilityOptions = [
    { value: "full_time", label: "Toàn thời gian", icon: Briefcase },
    { value: "part_time", label: "Bán thời gian", icon: Clock3 },
    { value: "weekends", label: "Cuối tuần", icon: Clock3 },
    { value: "flexible", label: "Linh hoạt", icon: RotateCcw },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      form: "",
    }));
  };

  const handleAvailabilityToggle = (optionValue) => {
    setFormData((prev) => {
      const exists = prev.availability.includes(optionValue);
      const nextAvailability = exists
        ? prev.availability.filter((item) => item !== optionValue)
        : [...prev.availability, optionValue];

      return {
        ...prev,
        availability: nextAvailability,
      };
    });

    setErrors((prev) => ({
      ...prev,
      availability: "",
      form: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!roleOptions.length) {
      nextErrors.skills = "Dự án này chưa cấu hình vai trò tình nguyện.";
    } else if (!formData.skills) {
      nextErrors.skills = "Vui lòng chọn vai trò ứng tuyển.";
    }

    if (!formData.availability.length) {
      nextErrors.availability = "Vui lòng chọn ít nhất một khung thời gian.";
    }

    if (!formData.motivation.trim()) {
      nextErrors.motivation = "Vui lòng chia sẻ lý do tham gia.";
    } else if (formData.motivation.trim().length < 10) {
      nextErrors.motivation = "Nội dung nên có ít nhất 10 ký tự.";
    }

    setErrors((prev) => ({
      ...prev,
      ...nextErrors,
      form: nextErrors.form || "",
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasChanges) {
      setErrors((prev) => ({
        ...prev,
        form: "Bạn chưa thay đổi thông tin nào.",
      }));
      return;
    }

    if (!validate()) return;

    const submitData = {
      ...formData,
      availability: formData.availability.join(", "),
    };

    onUpdate?.(submitData);
  };

  if (!mounted || !isOpen) return null;

  const motivationLength = formData.motivation.trim().length;

  const modalContent = (
    <div
      className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[4px] sm:p-6"
      onClick={() => {
        if (!isUpdating) onClose?.();
      }}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[#F2E6C9] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="h-1.5 w-full shrink-0 bg-[linear-gradient(90deg,#FACC15_0%,#F59E0B_55%,#FDE68A_100%)]" />

        <div className="shrink-0 border-b border-[#F3E7CC] bg-[linear-gradient(180deg,#FFFDF6_0%,#FFFFFF_100%)] px-6 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#F4DE9A] bg-[#FFF7D6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#A16207]">
                <Sparkles size={12} />
                Đơn đăng ký tình nguyện
              </div>

              <p className="truncate text-sm font-medium text-slate-500">
                {projectName || project?.title || "Dự án"}
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#0F2747]">
                Chỉnh sửa đơn đăng ký
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Cập nhật vai trò, thời gian tham gia và lý do ứng tuyển để ban
                tổ chức xem lại hồ sơ của bạn.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Đóng modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-7 sm:py-7">
            <div className="space-y-7">
              <section className="rounded-[24px] border border-slate-200 bg-[#FFFEFB] p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A6700]">
                    Vai trò ứng tuyển
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Chọn đúng vai trò tình nguyện mà dự án đang mở tuyển.
                  </p>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Chọn vai trò <span className="text-rose-500">*</span>
                </label>

                <div className="relative mt-2">
                  <select
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    disabled={!roleOptions.length}
                    className={`w-full appearance-none rounded-2xl border bg-white px-4 py-3.5 pr-11 text-[15px] text-slate-900 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
                      errors.skills
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                        : "border-slate-200 focus:border-[#F4B400] focus:ring-[#FDE68A]/50"
                    }`}
                  >
                    <option value="" disabled>
                      {roleOptions.length
                        ? "Chọn vai trò phù hợp"
                        : "Dự án chưa có vai trò tình nguyện"}
                    </option>
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {errors.skills ? (
                  <p className="mt-2 text-sm font-medium text-rose-500">
                    {errors.skills}
                  </p>
                ) : roleOptions.length ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Đang dùng danh sách vai trò từ chính dự án này.
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    Dự án chưa cấu hình vai trò nên chưa thể đổi vai trò.
                  </p>
                )}
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A6700]">
                    Thời gian tham gia
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Bạn có thể chọn nhiều khung thời gian nếu linh hoạt.
                  </p>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Thời gian tham gia <span className="text-rose-500">*</span>
                </label>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availabilityOptions.map((option) => {
                    const isSelected = formData.availability.includes(
                      option.value,
                    );
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAvailabilityToggle(option.value)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                          isSelected
                            ? "border-[#F4B400] bg-[#FFF8E1] text-[#0F2747] shadow-[0_8px_20px_rgba(244,180,0,0.12)]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#F4D06F] hover:bg-[#FFFDF6]"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                            isSelected
                              ? "bg-[#F4B400] text-slate-900"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {option.label}
                          </p>
                          <p className="text-xs text-slate-400">
                            {isSelected ? "Đã chọn" : "Nhấn để chọn"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errors.availability ? (
                  <p className="mt-2 text-sm font-medium text-rose-500">
                    {errors.availability}
                  </p>
                ) : null}
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#9A6700]">
                    Động lực tham gia
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Hãy nói ngắn gọn vì sao bạn phù hợp với dự án này và bạn có
                    thể đóng góp điều gì.
                  </p>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Vì sao bạn muốn tham gia dự án này?{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  rows={6}
                  className={`mt-2 min-h-[160px] w-full resize-y rounded-2xl border bg-white px-4 py-3.5 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    errors.motivation
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-[#F4B400] focus:ring-[#FDE68A]/50"
                  }`}
                  placeholder="Chia sẻ lý do tham gia, kinh nghiệm liên quan, hoặc cách bạn có thể hỗ trợ dự án..."
                />

                <div className="mt-2 flex items-center justify-between gap-3">
                  {errors.motivation ? (
                    <p className="text-sm font-medium text-rose-500">
                      {errors.motivation}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Tối thiểu 10 ký tự để ban tổ chức hiểu rõ hơn về bạn.
                    </p>
                  )}

                  <p
                    className={`shrink-0 text-xs font-semibold ${
                      motivationLength >= 10
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {motivationLength}/10+
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="shrink-0 border-t border-[#F3E7CC] bg-white px-6 py-4 sm:px-7">
            {errors.form ? (
              <p className="mb-3 text-sm font-medium text-amber-600">
                {errors.form}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isUpdating || !roleOptions.length || !hasChanges}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F4B400] px-6 py-3 text-sm font-bold text-slate-900 shadow-[0_10px_24px_rgba(244,180,0,0.24)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default VolunteerEditModal;
