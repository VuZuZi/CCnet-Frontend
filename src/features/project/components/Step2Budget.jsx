import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { strictStep2Schema } from '../validations/projectSchema';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useCreateDraftProject, useUpdateDraftProject } from '../hooks/useProjectMutations';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import { devConfig } from '@/config/app.config';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

import { FinancialPlanBlock } from './FinancialPlanBlock';
import { BudgetBreakdownBlock } from './BudgetBreakdownBlock';
import { MilestonesBlock } from './MilestonesBlock';
import { VolunteerRolesBlock } from './VolunteerRolesBlock';

const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
};

const getTierLimits = (tier) => {
  switch (tier) {
    case 3: return { maxFunding: 999999999999 };
    case 2: return { maxFunding: 200000000 };
    case 1:
    default: return { maxFunding: 50000000 };
  }
};

export default function Step2Budget() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { maxFunding } = getTierLimits(user?.kycTier || 1);

  const { formData, updateFormData, nextStep, prevStep, projectId, setProjectId } = useProjectDraftStore();
  const { mutateAsync: createDraft, isPending: isCreating } = useCreateDraftProject();
  const { mutateAsync: updateDraft, isPending: isUpdating } = useUpdateDraftProject();
  const toast = useToast();

  const isPending = isCreating || isUpdating;
  const isFunded = formData.projectType === 'FUNDED';

  const methods = useForm({
    resolver: zodResolver(strictStep2Schema(isFunded, maxFunding, formData.startDate, formData.endDate)),
    defaultValues: {
      targetAmount: formData.targetAmount || 0,
      mvpAmount: formData.mvpAmount || 0,
      budgetBreakdown: formData.budgetBreakdown?.length ? formData.budgetBreakdown : [],
      milestones: formData.milestones?.length
        ? formData.milestones.map(m => ({
          ...m,
          startDate: formatDateForInput(m.startDate),
          endDate: formatDateForInput(m.endDate)
        }))
        : [],
      needsVolunteers: isFunded ? (formData.needsVolunteers || false) : true,
      volunteerRoles: formData.volunteerRoles?.length ? formData.volunteerRoles : [],
    }
  });

  const { register, control, handleSubmit, setValue, getValues, formState: { errors } } = methods;

  useEffect(() => {
    if (!isFunded) {
      setValue('needsVolunteers', true);
      setValue('targetAmount', 0);
      setValue('mvpAmount', 0);
      setValue('budgetBreakdown', []);
      const currentMilestones = getValues('milestones') || [];
      currentMilestones.forEach((m, idx) => {
        if (m.targetAmount > 0) setValue(`milestones.${idx}.targetAmount`, 0);
      });
    }
  }, [isFunded, setValue, getValues]);

  const normalizeDataForSave = (data) => {
    const normalizedVolunteerRoles = (data.volunteerRoles || []).map((role) => ({
      title: role?.title || '',
      quantity: Number(role?.quantity || 0),
      skillsRequired: Array.isArray(role?.skillsRequired)
        ? role.skillsRequired
        : String(role?.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
      location: role?.location || '',
      duration: role?.duration || '',
    }));

    const step2Payload = isFunded ? data : {
      ...data,
      targetAmount: 0,
      mvpAmount: 0,
      budgetBreakdown: [],
      milestones: data.milestones.map(m => ({ ...m, targetAmount: 0 }))
    };

    return {
      ...step2Payload,
      volunteerRoles: step2Payload.needsVolunteers ? normalizedVolunteerRoles : [],
    };
  };

  const executeSave = async (data, isAutoSave = false) => {
    try {
      const normalizedPayload = normalizeDataForSave(data);
      updateFormData(normalizedPayload);

      const fullFormData = {
        ...useProjectDraftStore.getState().formData,
        ...normalizedPayload,
      };

      if (!projectId) {
        const created = await createDraft(isAutoSave ? { ...fullFormData, silent: true } : fullFormData);
        if (created?._id) setProjectId(created._id);
      } else {
        await updateDraft({ id: projectId, data: fullFormData, silent: isAutoSave });
      }

      if (!isAutoSave) toast.success('Đã lưu bản nháp an toàn!');
      return true;
    } catch (error) {
      const apiMessage = error?.response?.data?.message || 'Lưu dữ liệu thất bại.';
      toast.error(apiMessage);
      devConfig.error("[CTO Log] Save Step 2 Failed:", error);
      return false;
    }
  };

  const handleNextStep = handleSubmit(async (data) => {
    const isSuccess = await executeSave(data, true);
    if (isSuccess) {
      nextStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, (validationErrors) => {
    devConfig.log('[CTO Log] Form Validation Failed:', validationErrors);
    toast.error('Dữ liệu chưa hợp lệ. Vui lòng kiểm tra các mục được bôi đỏ!');
  });

  return (
    <FormProvider {...methods}>
      <form className="pb-32 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <fieldset disabled={isPending} className="space-y-8 disabled:opacity-60 disabled:cursor-not-allowed">

          {isFunded && (
            <>
              <FinancialPlanBlock control={control} errors={errors} />
              <BudgetBreakdownBlock
  control={control}
  register={register}
  errors={errors}
/>
            </>
          )}

          <MilestonesBlock
            control={control}
            errors={errors}
            isFunded={isFunded}
            projectStartDate={formData.startDate}
            projectEndDate={formData.endDate}
          />

          <VolunteerRolesBlock
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            isFunded={isFunded}
          />

        </fieldset>

        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-4 px-4 sm:px-6 lg:px-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-3 font-bold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <ArrowLeft size={18} /> Quay lại
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => executeSave(getValues(), false)}
                disabled={isPending}
                className="hidden md:flex items-center gap-2 px-6 py-3 font-bold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm disabled:opacity-50"
              >
                <Save size={18} /> Lưu bản nháp
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={isPending}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 font-bold rounded-xl shadow-sm transition-all",
                  isPending ? "bg-slate-400 text-white" : "bg-[#fbbf24] text-white hover:bg-[#f59e0b] shadow-[#fbbf24]/20"
                )}
              >
                {isPending && <Loader2 className="animate-spin" size={18} />}
                {isPending ? 'Đang xử lý...' : 'Bước cuối: Xem trước'}
                {!isPending && <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}