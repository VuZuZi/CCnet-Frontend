import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { getStep1Schema } from '../validations/projectSchema';
import { useProjectDraftStore } from '../stores/useProjectDraftStore';
import { useCreateDraftProject, useUpdateDraftProject } from '../hooks/useProjectMutations';
import { Shield, ArrowRight } from 'lucide-react';

import LocationPicker from '@/shared/components/ui/LocationPicker';
import { TipTapEditor } from '@/shared/components/ui/TipTapEditor';
import { MediaDropzone } from '@/shared/components/ui/MediaDropzone';

export default function Step1Story() {
  const { t } = useTranslation();
  // Ensure i18n is initialized correctly
  const { formData, updateFormData, addDeletedDocumentId, nextStep, projectId } = useProjectDraftStore();

  const { mutateAsync: createDraft, isPending: isCreating } = useCreateDraftProject();
  const { mutateAsync: updateDraft, isPending: isUpdating } = useUpdateDraftProject();

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(getStep1Schema(t)),
    defaultValues: {
      title: formData.title || '',
      category: formData.category || '',
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      location: formData.location || null,
      description: formData.description || '',
      coverMedia: formData.coverMedia || [],
      documents: formData.documents || []
    }
  });

  const isPending = isCreating || isUpdating;
  const titleValue = watch('title', '');

  const onSubmit = async (data) => {
    try {
      const safeDescription = DOMPurify.sanitize(data.description);

      const payload = {
        ...data,
        description: safeDescription,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      updateFormData(payload);

      if (!projectId) {
        await createDraft(payload);
      } else {
        await updateDraft({
          id: projectId,
          data: { ...payload, deletedDocumentIds: formData.deletedDocumentIds }
        });
      }

      nextStep();
    } catch (error) {
      console.error("[CTO Log] Submit Step 1 Failed:", error);
    }
  };

  const handleRemoveDocument = (file) => {
    if (file && file._id) {
      addDeletedDocumentId(file._id);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-32">
      <fieldset disabled={isPending} className="grid grid-cols-1 lg:grid-cols-12 gap-8 group transition-opacity duration-300 disabled:opacity-60 disabled:cursor-not-allowed">

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">{t('project.basic_info')}</h2>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">{t('project.title_label')}</label>
                <span className={`text-xs font-medium ${titleValue.length > 70 ? 'text-red-500' : 'text-slate-500'}`}>
                  {titleValue.length}/70
                </span>
              </div>
              <input
                {...register('title')}
                className={`w-full rounded-xl p-3 border outline-none transition-all shadow-sm bg-slate-50 text-slate-900 placeholder-slate-400
                    ${errors.title ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary'}`}
                placeholder={t('project.title_placeholder')}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('project.category_label')}</label>
                <select
                  {...register('category')}
                  className={`w-full rounded-xl p-3 border outline-none transition-all shadow-sm bg-slate-50 text-slate-900
                      ${errors.category ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary'}`}
                >
                  <option value="">{t('project.category_placeholder')}</option>
                  <option value="MOI_TRUONG">{t('project.categories.MOI_TRUONG')}</option>
                  <option value="GIAO_DUC">{t('project.categories.GIAO_DUC')}</option>
                  <option value="Y_TE">{t('project.categories.Y_TE')}</option>
                  <option value="THIEN_TAI">{t('project.categories.THIEN_TAI')}</option>
                  <option value="XAY_DUNG">{t('project.categories.XAY_DUNG')}</option>
                  <option value="KHAC">{t('project.categories.KHAC')}</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('project.location_label')}</label>
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
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('project.start_date')}</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className={`w-full rounded-xl p-3 border outline-none transition-all shadow-sm bg-slate-50 text-slate-900
                      ${errors.startDate ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary'}`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.startDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('project.end_date')}</label>
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
            <h2 className="text-xl font-bold text-slate-900">{t('project.story_title')}</h2>
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

        <div className="lg:col-span-5 space-y-6">

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
            <div className="text-amber-600 flex-shrink-0 mt-0.5">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-800 text-sm">{t('project.transparency_check')}</h4>
              <p className="text-sm text-amber-700 mt-1">{t('project.ai_scan_msg')}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">{t('project.cover_media')}</h2>
            <Controller
              name="coverMedia"
              control={control}
              render={({ field }) => (
                <MediaDropzone
                  value={field.value}
                  onChange={field.onChange}
                  maxFiles={1}
                  accept={{ 'image/*': [], 'video/*': [] }}
                  uploadContext="project_cover"
                  appearance="cover"
                />
              )}
            />
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">{t('project.verification_docs')}</h2>
            <p className="text-sm text-slate-500">{t('project.verification_docs_desc')}</p>
            <Controller
              name="documents"
              control={control}
              render={({ field }) => (
                <div className={errors.documents ? 'ring-2 ring-red-200 rounded-xl' : ''}>
                  <MediaDropzone
                    value={field.value}
                    onChange={field.onChange}
                    onRemove={handleRemoveDocument}
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
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <button
            type="button"
            className="px-6 py-3 font-bold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            {t('project.save_exit')}
          </button>
          <button
            type="submit"
            className={`flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all
              ${isPending ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-yellow-500/20'}`}
          >
            {isPending ? t('project.processing') : t('project.next_step')}
            {!isPending && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </form>
  );
}