import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import { strictStep1Schema } from '../validations/projectSchema';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useCreateDraftProject, useUpdateDraftProject } from '../hooks/useProjectMutations';
import { Shield, ArrowRight, Save, Loader2, AlertCircle } from 'lucide-react';

import LocationPicker from '@/shared/components/ui/LocationPicker';
import { TipTapEditor } from '@/shared/components/ui/TipTapEditor';
import { MediaDropzone } from '@/shared/components/ui/MediaDropzone';
import { devConfig } from '@/config/app.config';
import { useToast } from '@/shared/contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';

const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
};

const getTodayInputValue = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

const addDaysToInputDate = (dateString, days) => {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

const getTierLimits = (tier) => {
  switch (tier) {
    case 3:
      return { maxDurationDays: 90 };
    case 2:
      return { maxDurationDays: 60 };
    case 1:
    default:
      return { maxDurationDays: 30 };
  }
};

export default function Step1Story() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isMediaUploading, setIsMediaUploading] = useState(false);

  const [isTypeConfirmModalOpen, setIsTypeConfirmModalOpen] = useState(false);
  useBodyScrollLock(isSaveModalOpen || isTypeConfirmModalOpen);
  const [pendingType, setPendingType] = useState(null);

  const [draftMeta, setDraftMeta] = useState({
    title: '',
    projectType: 'FUNDED',
  });

  const user = useAuthStore((state) => state.user);
  const { maxDurationDays } = getTierLimits(user?.kycTier || 1);

  const {
    formData,
    updateFormData,
    addDeletedDocumentId,
    clearDeletedDocumentIds,
    nextStep,
    projectId,
    setProjectId
  } = useProjectDraftStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(strictStep1Schema(maxDurationDays)),
    defaultValues: {
      projectType: formData.projectType || 'FUNDED',
      title: formData.title || '',
      category: formData.category || '',
      startDate: formatDateForInput(formData.startDate),
      endDate: formatDateForInput(formData.endDate),
      location: formData.location || null,
      description: formData.description || '',
      beneficiaryInfo: formData.beneficiaryInfo || { details: '' },
      coverMedia: formData.coverMedia || [],
      documents: formData.documents || []
    }
  });

  const { mutateAsync: createDraft, isPending: isCreating } = useCreateDraftProject();
  const { mutateAsync: updateDraft, isPending: isUpdating } = useUpdateDraftProject();

  const isPending = isCreating || isUpdating;
  const isSubmitDisabled = isPending || isMediaUploading;

  const projectTypeValue = watch('projectType');
  const titleValue = watch('title', '');
  const startDateValue = watch('startDate');
  const endDateValue = watch('endDate');

  const todayInputValue = useMemo(() => getTodayInputValue(), []);

  const endDateMin = useMemo(() => {
    if (!startDateValue) return todayInputValue;
    return startDateValue < todayInputValue ? todayInputValue : startDateValue;
  }, [startDateValue, todayInputValue]);

  const startDateMax = useMemo(() => {
    return addDaysToInputDate(todayInputValue, maxDurationDays);
  }, [todayInputValue, maxDurationDays]);

  const endDateMax = useMemo(() => {
    if (!startDateValue) return '';
    return addDaysToInputDate(startDateValue, maxDurationDays);
  }, [startDateValue, maxDurationDays]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isMediaUploading || isPending) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isMediaUploading, isPending]);

  useEffect(() => {
    if (!startDateValue) return;

    if (startDateValue < todayInputValue) {
      setValue('startDate', todayInputValue, { shouldValidate: true, shouldDirty: true });
      return;
    }

    if (startDateMax && startDateValue > startDateMax) {
      setValue('startDate', startDateMax, { shouldValidate: true, shouldDirty: true });
      return;
    }

    if (endDateValue) {
      const invalidMin = endDateValue < endDateMin;
      const invalidMax = endDateMax && endDateValue > endDateMax;

      if (invalidMin || invalidMax) {
        setValue('endDate', '', { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [
    startDateValue,
    endDateValue,
    todayInputValue,
    endDateMin,
    endDateMax,
    startDateMax,
    setValue
  ]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const currentType = getValues('projectType');
    const hasBudgetData = formData?.targetAmount > 0 || (formData?.milestones?.some((m) => m.targetAmount > 0));

    if (currentType === 'FUNDED' && newType === 'VOLUNTEER_ONLY' && hasBudgetData) {
      setPendingType(newType);
      setIsTypeConfirmModalOpen(true);
    } else {
      setValue('projectType', newType, { shouldValidate: true, shouldDirty: true });
    }
  };

  const confirmChangeType = () => {
    if (pendingType) {
      setValue('projectType', pendingType, { shouldValidate: true, shouldDirty: true });
      updateFormData({
        targetAmount: 0,
        mvpAmount: 0,
        budgetBreakdown: [],
        milestones: formData?.milestones?.map((m) => ({ ...m, targetAmount: 0 })) || []
      });
    }
    setIsTypeConfirmModalOpen(false);
  };

  const processPayload = (data) => {
    const safeDescription = data.description ? DOMPurify.sanitize(data.description) : '';
    const safeBeneficiary = data.beneficiaryInfo?.details ? DOMPurify.sanitize(data.beneficiaryInfo.details) : '';

    return {
      ...data,
      description: safeDescription,
      beneficiaryInfo: { details: safeBeneficiary },
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      ...(formData.fromHelpRequestId ? { fromHelpRequestId: formData.fromHelpRequestId } : {}),
    };
  };

  const executeSaveDraft = async (data, isExit = false) => {
    try {
      const payload = processPayload(data);
      updateFormData(payload);

      if (!projectId) {
        const created = await createDraft(payload);
        if (created?._id) {
          navigate(`/projects/create/${created._id}/edit`, { replace: true });
        }
      } else {
        await updateDraft({
          id: projectId,
          data: { ...payload, deletedDocumentIds: formData.deletedDocumentIds }
        });
        clearDeletedDocumentIds();
      }

      if (isExit) {
        toast.success('Đã lưu bản nháp an toàn!');
        navigate('/projects');
      }
    } catch (error) {
      devConfig.error('[CTO Log] Save Step 1 Failed:', error);
    }
  };

  const onInvalid = (errors) => {
    devConfig.log('Form Validation Failed:', errors);
    toast.error('Dữ liệu chưa hợp lệ. Vui lòng kiểm tra các mục được bôi đỏ!');
  };

  const handleNextStep = handleSubmit(async (validData) => {
    const payload = processPayload(validData);
    const fullFormData = { ...formData, ...payload };
    updateFormData(payload);

    try {
      if (!projectId) {
        const created = await createDraft({ ...fullFormData, silent: true });
        if (created?._id && setProjectId) setProjectId(created._id);
      } else {
        await updateDraft({
          id: projectId,
          data: { ...fullFormData, deletedDocumentIds: formData.deletedDocumentIds },
          silent: true
        });
        clearDeletedDocumentIds();
      }
      nextStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      devConfig.log('Error auto-saving draft:', error);
    }
  }, onInvalid);

  const openSaveModal = () => {
    setDraftMeta({
      title: getValues('title') || '',
      projectType: getValues('projectType') || 'FUNDED',
    });
    setIsSaveModalOpen(true);
  };

  const confirmSaveDraft = async () => {
    setValue('title', draftMeta.title);
    setValue('projectType', draftMeta.projectType);

    setIsSaveModalOpen(false);

    const currentData = getValues();

    const dataToSave = {
      ...currentData,
      title: draftMeta.title,
      projectType: draftMeta.projectType
    };

    await executeSaveDraft(dataToSave, true);
  };

  const handleRemoveMedia = (fileToRemove) => {
    if (fileToRemove && fileToRemove._id) {
      addDeletedDocumentId(fileToRemove._id);
    }
  };

  return (
    <form onSubmit={handleNextStep} className="animate-in fade-in slide-in-from-bottom-4 pb-32 duration-500">
      <fieldset
        disabled={isSubmitDisabled}
        className="group grid grid-cols-1 gap-8 transition-opacity duration-300 disabled:cursor-not-allowed disabled:opacity-60 lg:grid-cols-12"
      >
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Loại dự án</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${projectTypeValue === 'FUNDED' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input
                    type="radio"
                    value="FUNDED"
                    name="projectType"
                    checked={projectTypeValue === 'FUNDED'}
                    onChange={handleTypeChange}
                    className="sr-only"
                  />
                  <div className="font-bold text-slate-900">Dự án gây quỹ</div>
                  <p className="mt-1 text-sm text-slate-500">Gây quỹ và tuyển tình nguyện viên.</p>
                </label>

                <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${projectTypeValue === 'VOLUNTEER_ONLY' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input
                    type="radio"
                    value="VOLUNTEER_ONLY"
                    name="projectType"
                    checked={projectTypeValue === 'VOLUNTEER_ONLY'}
                    onChange={handleTypeChange}
                    className="sr-only"
                  />
                  <div className="font-bold text-slate-900">Chỉ tình nguyện viên</div>
                  <p className="mt-1 text-sm text-slate-500">Không gây quỹ, chỉ cần nguồn lực con người.</p>
                </label>
              </div>
              {errors.projectType && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.projectType.message}</p>}
            </div>

            <hr className="border-slate-100" />

            <h2 className="text-xl font-bold text-slate-900">Thông tin cơ bản</h2>

            <div>
              <div className="mb-2 flex justify-between">
                <label className="block text-sm font-bold text-slate-700">Tên dự án</label>
                <span className={`text-xs font-medium ${titleValue.length > 100 ? 'text-red-500' : 'text-slate-500'}`}>
                  {titleValue.length}/100
                </span>
              </div>
              <input
                {...register('title')}
                className={`w-full rounded-xl border bg-slate-50 p-3 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary'}`}
                placeholder="Ví dụ: Xây cầu chống lũ tại bản Pa Tần"
              />
              {errors.title && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Danh mục</label>
                <select
                  {...register('category')}
                  className={`w-full rounded-xl border bg-slate-50 p-3 text-slate-900 shadow-sm outline-none transition-all ${errors.category ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary'}`}
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Y_TE">Y tế</option>
                  <option value="GIAO_DUC">Giáo dục</option>
                  <option value="THIEN_TAI">Cứu trợ thiên tai</option>
                  <option value="XAY_DUNG">Xây dựng hạ tầng</option>
                  <option value="MOI_TRUONG">Bảo vệ môi trường</option>
                  <option value="KHAC">Khác</option>
                </select>
                {errors.category && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.category.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Địa điểm</label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <div className={errors.location?.address || errors.location ? 'rounded-xl ring-2 ring-red-200' : ''}>
                      <LocationPicker
                        value={field.value}
                        onChange={field.onChange}
                        hasError={!!errors.location?.address || !!errors.location}
                      />
                    </div>
                  )}
                />
                {(errors.location?.address || errors.location) && (
                  <p className="mt-1.5 text-sm font-medium text-red-500">
                    {errors.location?.address?.message || errors.location?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
              <div>
  <label className="mb-2 block text-sm font-bold text-slate-700">Ngày bắt đầu dự kiến</label>
  <input
    type="date"
    min={todayInputValue}
    max={startDateMax}
    {...register('startDate')}
    className={`w-full rounded-2xl border bg-gradient-to-b from-white to-slate-50 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition-all [color-scheme:light] ${
      errors.startDate
        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
        : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100'
    }`}
  />
  <p className="mt-2 text-xs text-slate-500">
    Chỉ được chọn từ hôm nay đến tối đa {maxDurationDays} ngày tiếp theo.
  </p>
  {errors.startDate && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.startDate.message}</p>}
</div>

              <div>
  <label className="mb-2 block text-sm font-bold text-slate-700">Ngày kết thúc dự kiến</label>
  <input
    type="date"
    min={endDateMin}
    max={endDateMax || undefined}
    disabled={!startDateValue}
    {...register('endDate')}
    className={`w-full rounded-2xl border bg-gradient-to-b from-white to-slate-50 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition-all [color-scheme:light] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
      errors.endDate
        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
        : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100'
    }`}
  />
  <p className="mt-2 text-xs text-slate-500">
    {!startDateValue
      ? 'Hãy chọn ngày bắt đầu trước.'
      : `Chỉ được chọn từ ngày bắt đầu đến tối đa ${maxDurationDays} ngày sau ngày bắt đầu.`}
  </p>
  {errors.endDate && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.endDate.message}</p>}
</div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Câu chuyện & đối tượng thụ hưởng</h2>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Mô tả đối tượng thụ hưởng</label>
              <textarea
                {...register('beneficiaryInfo.details')}
                className={`min-h-[100px] w-full resize-y rounded-xl border bg-slate-50 p-3 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 ${errors.beneficiaryInfo?.details ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary'}`}
                placeholder="Ai sẽ nhận được hỗ trợ từ dự án này? Khoảng bao nhiêu người?"
              />
              {errors.beneficiaryInfo?.details && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.beneficiaryInfo.details.message}</p>}
            </div>

            <div className="pt-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Câu chuyện chi tiết</label>
              <div className={errors.description ? 'rounded-xl ring-2 ring-red-200' : ''}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TipTapEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
              {errors.description && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="mt-0.5 flex-shrink-0 text-amber-600">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800">Kiểm tra minh bạch</h4>
              <p className="mt-1 text-sm text-amber-700">
                Hệ thống AI sẽ tự động quét tính nguyên bản của hình ảnh. Vui lòng sử dụng ảnh thật.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Ảnh / video đại diện dự án</h2>
            <Controller
              name="coverMedia"
              control={control}
              render={({ field }) => (
                <MediaDropzone
                  value={field.value}
                  onChange={field.onChange}
                  onRemove={handleRemoveMedia}
                  onUploadingStatus={setIsMediaUploading}
                  maxFiles={1}
                  accept={{ 'image/*': [], 'video/*': [] }}
                  uploadContext="project_cover"
                  appearance="cover"
                />
              )}
            />
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Tài liệu & giấy tờ</h2>
            <p className="text-sm text-slate-500">
              Tải lên báo giá, giấy phép hoặc giấy xác nhận địa phương để tăng độ tin cậy.
            </p>
            <Controller
              name="documents"
              control={control}
              render={({ field }) => (
                <div className={errors.documents ? 'rounded-xl ring-2 ring-red-200' : ''}>
                  <MediaDropzone
                    value={field.value}
                    onChange={field.onChange}
                    onRemove={handleRemoveMedia}
                    onUploadingStatus={setIsMediaUploading}
                    maxFiles={5}
                    accept={{ 'application/pdf': [], 'image/*': [] }}
                    uploadContext="project_document"
                    appearance="document"
                  />
                </div>
              )}
            />
            {errors.documents && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.documents.message}</p>}
          </div>
        </div>
      </fieldset>

      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <button
            type="button"
            onClick={openSaveModal}
            disabled={isSubmitDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
          >
            <Save size={18} /> {isMediaUploading ? 'Đang tải tệp...' : 'Lưu bản nháp và thoát'}
          </button>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 font-bold shadow-sm transition-all sm:w-auto ${isSubmitDisabled ? 'cursor-not-allowed bg-slate-400 text-white' : 'bg-primary text-white shadow-lg shadow-yellow-500/20 hover:bg-primary-hover'}`}
          >
            {isPending && <Loader2 className="animate-spin" size={20} />}
            {isMediaUploading ? 'Vui lòng đợi ảnh tải lên...' : isPending ? 'Đang xử lý...' : 'Tiếp theo: Ngân sách & nhân sự'}
            {!isSubmitDisabled && !isMediaUploading && <ArrowRight size={20} />}
          </button>
        </div>
      </div>

      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7">
            <h3 className="text-lg font-black text-slate-900">Lưu bản nháp</h3>
            <p className="mt-1 text-sm text-slate-500">
              Đặt tên bản nháp và chọn loại dự án trước khi lưu. Bạn có thể tiếp tục chỉnh sửa sau.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Tên bản nháp</label>
                <input
                  value={draftMeta.title}
                  onChange={(e) => setDraftMeta((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tên bản nháp..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Loại dự án</label>
                <select
                  value={draftMeta.projectType}
                  onChange={(e) => setDraftMeta((prev) => ({ ...prev, projectType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="FUNDED">Dự án gây quỹ</option>
                  <option value="VOLUNTEER_ONLY">Chỉ tình nguyện viên</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmSaveDraft}
                disabled={isSubmitDisabled}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && <Loader2 className="animate-spin" size={14} />}
                {!isPending && <Save size={14} />}
                Lưu bản nháp
              </button>
            </div>
          </div>
        </div>
      )}

      {isTypeConfirmModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 duration-150">
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Xóa dữ liệu tài chính?</h3>
              <p className="mt-2 text-sm text-slate-500">
                Việc chuyển sang <b>Dự án tình nguyện</b> sẽ xóa toàn bộ kế hoạch ngân sách đã lập ở bước sau. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTypeConfirmModalOpen(false)}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmChangeType}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white hover:bg-red-700"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
