import React, { useMemo, useState } from 'react';
import { BriefcaseBusiness, CalendarRange, FileText } from 'lucide-react';
import { useVolunteerMutations } from '../hooks/useVolunteerMutations';
import { useToast } from '@/shared/contexts/ToastContext';

export const VolunteerApplicationForm = ({ project, projectId, onSuccess, onCancel }) => {
  const { createApplication, isCreating } = useVolunteerMutations();
  const toast = useToast();

  const roleOptions = useMemo(() => {
    if (!Array.isArray(project?.volunteerRoles)) return [];

    return project.volunteerRoles
      .map((role, index) => {
        const title = String(role?.title || '').trim();
        const quantity = Number(role?.quantity || 0);

        if (!title) return null;

        return {
          id: `${title}-${index}`,
          value: title,
          label: title,
          quantity,
          skillsRequired: Array.isArray(role?.skillsRequired)
            ? role.skillsRequired.filter(Boolean)
            : [],
          duration: role?.duration || '',
          location: role?.location || '',
        };
      })
      .filter(Boolean);
  }, [project]);

  const availabilityOptions = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'WEEKENDS', label: 'Weekends' },
    { value: 'FLEXIBLE', label: 'Flexible' },
  ];

  const [formData, setFormData] = useState({
    opportunityId: projectId,
    skills: '',
    availability: '',
    motivation: '',
  });

  const [errors, setErrors] = useState({});

  const selectedRole = roleOptions.find((role) => role.value === formData.skills) || null;

  const handleSelectRole = (roleValue) => {
    setFormData((prev) => ({ ...prev, skills: roleValue }));

    if (errors.skills) {
      setErrors((prev) => ({ ...prev, skills: '' }));
    }
  };

  const handleSelectAvailability = (availabilityValue) => {
    setFormData((prev) => ({ ...prev, availability: availabilityValue }));

    if (errors.availability) {
      setErrors((prev) => ({ ...prev, availability: '' }));
    }
  };

  const handleChangeMotivation = (e) => {
    setFormData((prev) => ({ ...prev, motivation: e.target.value }));

    if (errors.motivation) {
      setErrors((prev) => ({ ...prev, motivation: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.skills) {
      newErrors.skills = 'Vui lòng chọn vị trí ứng tuyển';
    }

    if (!formData.availability) {
      newErrors.availability = 'Vui lòng chọn một khung thời gian';
    }

    if (!formData.motivation.trim()) {
      newErrors.motivation = 'Vui lòng chia sẻ động lực tham gia';
    } else if (formData.motivation.trim().length < 10) {
      newErrors.motivation = 'Nội dung nên có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createApplication({
        opportunityId: projectId,
        skills: formData.skills,
        availability: formData.availability,
        motivation: formData.motivation.trim(),
      });

      onSuccess?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Đăng ký thất bại. Vui lòng thử lại sau.';

      toast.error(message);
    }
  };

  const motivationLength = formData.motivation.trim().length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Vị trí ứng tuyển
            </h3>
            <p className="text-sm text-slate-500">
              Chọn vai trò phù hợp với khả năng của bạn
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {roleOptions.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {roleOptions.map((role) => {
                const isActive = formData.skills === role.value;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role.value)}
                    className={`rounded-[22px] border p-4 text-left transition-all ${
                      isActive
                        ? 'border-amber-300 bg-amber-50 shadow-sm ring-2 ring-amber-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-slate-900">
                          {role.label}
                        </div>
                        {role.quantity > 0 ? (
                          <div className="mt-1 text-sm text-slate-500">
                            Cần {role.quantity} người
                          </div>
                        ) : null}
                      </div>

                      <div
                        className={`mt-1 h-4 w-4 rounded-full border-2 ${
                          isActive
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-slate-300 bg-white'
                        }`}
                      />
                    </div>

                    {role.skillsRequired?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {role.skillsRequired.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Dự án hiện chưa cấu hình danh sách vai trò volunteer.
            </div>
          )}

          {errors.skills ? (
            <p className="text-sm text-red-500">{errors.skills}</p>
          ) : null}

          {selectedRole ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {selectedRole.location ? (
                <div>Địa điểm: {selectedRole.location}</div>
              ) : null}
              {selectedRole.duration ? (
                <div className={selectedRole.location ? 'mt-1' : ''}>
                  Thời lượng: {selectedRole.duration}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <CalendarRange size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Thời gian có thể tham gia
            </h3>
            <p className="text-sm text-slate-500">
              Chọn một khung thời gian phù hợp nhất
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {availabilityOptions.map((option) => {
            const isSelected = formData.availability === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectAvailability(option.value)}
                className={`group rounded-full px-5 py-3 text-sm font-bold transition-all ${
                  isSelected
                    ? 'border border-amber-300 bg-amber-50 text-amber-800 shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isSelected ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  />
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {errors.availability ? (
          <p className="text-sm text-red-500">{errors.availability}</p>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Giới thiệu bản thân
            </h3>
            <p className="text-sm text-slate-500">
              Hãy cho organizer thấy vì sao bạn phù hợp với dự án này
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Lý do bạn muốn tham gia dự án này <span className="text-red-500">*</span>
          </label>

          <div
            className={`overflow-hidden rounded-[24px] border bg-white transition-all ${
              errors.motivation
                ? 'border-red-400'
                : 'border-slate-200 shadow-sm'
            }`}
          >
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleChangeMotivation}
              rows={6}
              className="min-h-[180px] w-full resize-none border-0 bg-transparent px-5 py-4 text-base leading-7 text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Hãy chia sẻ động lực tham gia, kỹ năng liên quan và cách bạn có thể đóng góp cho dự án..."
            />

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              {errors.motivation ? (
                <p className="text-sm text-red-500">{errors.motivation}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  Nội dung rõ ràng sẽ giúp organizer đánh giá tốt hơn.
                </p>
              )}

              <div
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  motivationLength >= 10
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {motivationLength} ký tự
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-4 border-t">
  <button
    type="button"
    onClick={onCancel}
    disabled={isCreating}
    className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100"
  >
    Hủy
  </button>

  <button
    type="submit"
    disabled={isCreating || roleOptions.length === 0}
    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold"
  >
    {isCreating ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
  </button>
</div>
    </form>
  );
};