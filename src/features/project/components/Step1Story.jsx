import { useEffect, useState } from 'react';
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

const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
};

const getTierLimits = (tier) => {
  switch (tier) {
    case 3: return { maxDurationDays: 90 };
    case 2: return { maxDurationDays: 60 };
    case 1:
    default: return { maxDurationDays: 30 };
  }
};

export default function Step1Story() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isMediaUploading, setIsMediaUploading] = useState(false);

  const [isTypeConfirmModalOpen, setIsTypeConfirmModalOpen] = useState(false);
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

  const { mutateAsync: createDraft, isPending: isCreating } = useCreateDraftProject();
  const { mutateAsync: updateDraft, isPending: isUpdating } = useUpdateDraftProject();

  const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors } } = useForm({
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

  const isPending = isCreating || isUpdating;
  const isSubmitDisabled = isPending || isMediaUploading;

  const projectTypeValue = watch('projectType');
  const titleValue = watch('title', '');

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

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const currentType = getValues('projectType');
    const hasBudgetData = formData?.targetAmount > 0 || (formData?.milestones?.some(m => m.targetAmount > 0));

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
        milestones: formData?.milestones?.map(m => ({ ...m, targetAmount: 0 })) || []
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
      devConfig.error("[CTO Log] Save Step 1 Failed:", error);
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
    <form onSubmit={handleNextStep} className="pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <fieldset disabled={isSubmitDisabled} className="grid grid-cols-1 lg:grid-cols-12 gap-8 group transition-opacity duration-300 disabled:opacity-60 disabled:cursor-not-allowed">

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Loại dự án</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${projectTypeValue === 'FUNDED' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input
                    type="radio"
                    value="FUNDED"
                    name="projectType"
                    checked={projectTypeValue === 'FUNDED'}
                    onChange={handleTypeChange}
                    className="sr-only"
                  />
                  <div className="font-bold text-slate-900">Dự án gây quỹ</div>
                  <p className="text-sm text-slate-500 mt-1">Gây quỹ và tuyển tình nguyện viên.</p>
                </label>

                <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${projectTypeValue === 'VOLUNTEER_ONLY' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input
                    type="radio"
                    value="VOLUNTEER_ONLY"
                    name="projectType"
                    checked={projectTypeValue === 'VOLUNTEER_ONLY'}
                    onChange={handleTypeChange}
                    className="sr-only"
                  />
                  <div className="font-bold text-slate-900">Chỉ tình nguyện viên</div>
                  <p className="text-sm text-slate-500 mt-1">Không gây quỹ, chỉ cần nguồn lực con người.</p>
                </label>
              </div>
              {errors.projectType && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.projectType.message}</p>}
            </div>

            <hr className="border-slate-100" />

            <h2 className="text-xl font-bold text-slate-900">Thông tin cơ bản</h2>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">Tên dự án</label>
                <span className={`text-xs font-medium ${titleValue.length > 100 ? 'text-red-500' : 'text-slate-500'}`}>
                  {titleValue.length}/100
                </span>
              </div>
              <input
                {...register('title')}
                className={`w-full rounded-xl p-3 border outline-none transition-all shadow-sm bg-slate-50 text-slate-900 placeholder-slate-400
                    ${errors.title ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary'}`}
                placeholder="Ví dụ: Xây cầu chống lũ tại bản Pa Tần"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Danh mục</label>
                <select
                  {...register('category')}
                  className={`w-full rounded-xl p-3 border outline-none transition-all shadow-sm bg-slate-50 text-slate-900
                      ${errors.category ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary'}`}
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Y_TE">Y tế</option>
                  <option value="GIAO_DUC">Giáo dục</option>
                  <option value="THIEN_TAI">Cứu trợ thiên tai</option>
                  <option value="XAY_DUNG">Xây dựng hạ tầng</option>
                  <option value="MOI_TRUONG">Bảo vệ môi trường</option>
                  <option value="KHAC">Khác</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Địa điểm</label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <div className={errors.location?.address || errors.location ? 'ring-2 ring-red-200 rounded-xl' : ''}>
                      <LocationPicker
                        value={field.value}
                        onChange={field.onChange}
                        hasError={!!errors.location?.address || !!errors.location}
                      />
                    </div>
                  )}
                />
                {(errors.location?.address || errors.location) && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">
                    {errors.location?.address?.message || errors.location?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ngày bắt đầu dự kiến</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className={`w-full rounded-xl p-3 border outline-none transition-all shadow-sm bg-slate-50 text-slate-900
                      ${errors.startDate ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary'}`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.startDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ngày kết thúc dự kiến</label>
                <input
                  type="date"
                  {...register('endDate')}
                  className={`w-full rounded-xl p-3 border outline-none transition-all shadow-sm bg-slate-50 text-slate-900
                      ${errors.endDate ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary'}`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.endDate.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Câu chuyện & đối tượng thụ hưởng</h2>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả đối tượng thụ hưởng</label>
              <textarea
                {...register('beneficiaryInfo.details')}
                className={`w-full rounded-xl p-3 border outline-none transition-all shadow-sm bg-slate-50 text-slate-900 placeholder-slate-400 min-h-[100px] resize-y
                    ${errors.beneficiaryInfo?.details ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary'}`}
                placeholder="Ai sẽ nhận được hỗ trợ từ dự án này? Khoảng bao nhiêu người?"
              />
              {errors.beneficiaryInfo?.details && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.beneficiaryInfo.details.message}</p>}
            </div>

            <div className="pt-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Câu chuyện chi tiết</label>
              <div className={errors.description ? 'ring-2 ring-red-200 rounded-xl' : ''}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TipTapEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
              {errors.description && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
            <div className="text-amber-600 flex-shrink-0 mt-0.5">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-800 text-sm">Kiểm tra minh bạch</h4>
              <p className="text-sm text-amber-700 mt-1">Hệ thống AI sẽ tự động quét tính nguyên bản của hình ảnh. Vui lòng sử dụng ảnh thật.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
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

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Tài liệu & giấy tờ</h2>
            <p className="text-sm text-slate-500">Tải lên báo giá, giấy phép hoặc giấy xác nhận địa phương để tăng độ tin cậy.</p>
            <Controller
              name="documents"
              control={control}
              render={({ field }) => (
                <div className={errors.documents ? 'ring-2 ring-red-200 rounded-xl' : ''}>
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
            {errors.documents && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.documents.message}</p>}
          </div>
        </div>

      </fieldset>

      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={openSaveModal}
            disabled={isSubmitDisabled}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={18} /> {isMediaUploading ? 'Đang tải tệp...' : 'Lưu bản nháp và thoát'}
          </button>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 font-bold rounded-xl transition-all shadow-sm
              ${isSubmitDisabled ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-yellow-500/20'}`}
          >
            {isPending && <Loader2 className="animate-spin" size={20} />}
            {isMediaUploading ? 'Vui lòng đợi ảnh tải lên...' : (isPending ? 'Đang xử lý...' : 'Tiếp theo: Ngân sách & nhân sự')}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Xóa dữ liệu tài chính?</h3>
              <p className="text-sm text-slate-500 mt-2">
                Việc chuyển sang <b>Dự án tình nguyện</b> sẽ xóa toàn bộ kế hoạch ngân sách đã lập ở bước sau. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTypeConfirmModalOpen(false)}
                className="flex-1 px-4 py-2.5 font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmChangeType}
                className="flex-1 px-4 py-2.5 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700"
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