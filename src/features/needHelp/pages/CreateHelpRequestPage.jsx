import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/Button/Button';
import { MediaDropzone } from '@/shared/components/ui/MediaDropzone';
import { LocationPicker } from '@/shared/components/ui/LocationPicker';

import { useCreateHelpRequest } from '../hooks/useHelpRequestMutations';
import {
  helpRequestSchema,
  defaultHelpRequestValues,
  HELP_REQUEST_CATEGORIES,
  URGENCY_LEVELS,
} from '../validations/helpRequestSchema';
import { FormSection } from '../components/form/FormSection';
import { FormField, getInputClass } from '../components/form/FormField';
import { SelectField } from '../components/form/SelectField';

export function CreateHelpRequestPage() {
  const createMutation = useCreateHelpRequest();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(helpRequestSchema),
    defaultValues: defaultHelpRequestValues,
  });

  const onSubmit = (data) => {
    // Clean up empty optional fields
    const payload = {
      title: data.title,
      story: data.story,
      category: data.category,
      urgencyLevel: data.urgencyLevel,
      amountNeeded: data.amountNeeded || 0,
    };

    // Add location if provided
    if (data.location?.coordinates && data.location.coordinates.length === 2) {
      payload.location = {
        type: 'Point',
        coordinates: data.location.coordinates,
        address: data.location.address || '',
      };
    }

    // Add evidences if provided
    if (data.evidences?.length > 0) {
      payload.evidences = data.evidences.map((e) => ({
        url: e.url,
        publicId: e.publicId || '',
        mediaType: e.url?.match(/\.(mp4|webm|mov)$/i) ? 'video' :
                   e.url?.match(/\.(pdf|doc|docx)$/i) ? 'document' : 'image',
        originalName: e.originalName || '',
      }));
    }

    // Add contact info if provided
    if (data.contactPhone) payload.contactPhone = data.contactPhone;
    if (data.contactEmail) payload.contactEmail = data.contactEmail;

    createMutation.mutate(payload);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          to="/need-help"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Help Requests
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Create a Help Request
        </h1>
        <p className="mt-3 text-slate-500 text-base sm:text-lg">
          Share your story and provide evidence to find a supporting organization.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details */}
        <FormSection title="Basic Details">
          <div className="space-y-6">
            <FormField label="Request Title" error={errors.title?.message} required>
              <input
                {...register('title')}
                placeholder="e.g., Emergency Medical Support Needed"
                className={getInputClass(!!errors.title)}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SelectField
                label="Category"
                options={HELP_REQUEST_CATEGORIES}
                error={errors.category?.message}
                required
                placeholder="Select a Category"
                {...register('category')}
              />

              <SelectField
                label="Urgency Level"
                options={URGENCY_LEVELS}
                error={errors.urgencyLevel?.message}
                {...register('urgencyLevel')}
              />
            </div>
          </div>
        </FormSection>

        {/* Location */}
        <FormSection title="Location">
          <FormField error={errors.location?.address?.message || errors.location?.message}>
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
          </FormField>
        </FormSection>

        {/* Story */}
        <FormSection title="Story & Situation">
          <FormField label="Story / Description" error={errors.story?.message} required>
            <textarea
              {...register('story')}
              rows={6}
              placeholder="Describe the situation in detail..."
              className={`${getInputClass(!!errors.story)} resize-y`}
            />
          </FormField>
        </FormSection>

        {/* Funding Goal */}
        <FormSection title="Funding Goal">
          <FormField label="Amount Needed (VND)" error={errors.amountNeeded?.message}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 font-medium">₫</span>
              </div>
              <input
                type="number"
                {...register('amountNeeded')}
                placeholder="0"
                className={`${getInputClass(!!errors.amountNeeded)} pl-8`}
              />
            </div>
          </FormField>
        </FormSection>

        {/* Evidence & Visuals */}
        <FormSection title="Evidence & Visuals">
          <FormField
            label="Upload photos, videos, or documents as evidence"
            error={errors.evidences?.message}
          >
            <Controller
              name="evidences"
              control={control}
              render={({ field }) => (
                <MediaDropzone
                  value={field.value}
                  onChange={field.onChange}
                  maxFiles={10}
                  accept={{
                    'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
                    'video/*': ['.mp4', '.webm'],
                    'application/pdf': ['.pdf'],
                  }}
                  uploadContext="help-request"
                  appearance="cover"
                />
              )}
            />
          </FormField>
          <p className="text-xs text-slate-500 mt-3">
            Upload photos, videos, or official documents. Max 10 files.
          </p>
        </FormSection>

        {/* Contact Information */}
        <FormSection title="Contact Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Phone Number" error={errors.contactPhone?.message}>
              <input
                type="tel"
                {...register('contactPhone')}
                placeholder="+84 xxx xxx xxx"
                className={getInputClass(!!errors.contactPhone)}
              />
            </FormField>

            <FormField label="Email" error={errors.contactEmail?.message}>
              <input
                type="email"
                {...register('contactEmail')}
                placeholder="you@example.com"
                className={getInputClass(!!errors.contactEmail)}
              />
            </FormField>
          </div>
        </FormSection>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="yellow"
            size="lg"
            className="w-full rounded-2xl shadow-lg shadow-amber-500/20"
            isLoading={createMutation.isPending}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </main>
  );
}

export default CreateHelpRequestPage;
