import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CircleAlert, Loader2, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/shared/components/ui/Button/Button';
import { MediaDropzone } from '@/shared/components/ui/MediaDropzone';
import { LocationPicker } from '@/shared/components/ui/LocationPicker';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

import { useHelpRequestDetail } from '../hooks/useHelpRequestQueries';
import { useDeleteHelpRequest, useUpdateHelpRequest } from '../hooks/useHelpRequestMutations';
import {
  defaultHelpRequestValues,
  helpRequestSchema,
  HELP_REQUEST_CATEGORIES,
  URGENCY_LEVELS,
} from '../validations/helpRequestSchema';
import { FormSection } from '../components/form/FormSection';
import { FormField, getInputClass } from '../components/form/FormField';
import { SelectField } from '../components/form/SelectField';

const buildPayload = (data) => {
  const payload = {
    title: data.title,
    story: data.story,
    category: data.category,
    urgencyLevel: data.urgencyLevel,
    amountNeeded: data.amountNeeded || 0,
  };

  if (data.location?.coordinates && data.location.coordinates.length === 2) {
    payload.location = {
      type: 'Point',
      coordinates: data.location.coordinates,
      address: data.location.address || '',
    };
  }

  if (data.evidences?.length > 0) {
    payload.evidences = data.evidences.map((evidence) => ({
      url: evidence.url,
      publicId: evidence.publicId || '',
      mediaType:
        evidence.mediaType ||
        (evidence.url?.match(/\.(mp4|webm|mov)$/i)
          ? 'video'
          : evidence.url?.match(/\.(pdf|doc|docx)$/i)
            ? 'document'
            : 'image'),
      originalName: evidence.originalName || '',
    }));
  }

  if (data.contactPhone) payload.contactPhone = data.contactPhone;
  if (data.contactEmail) payload.contactEmail = data.contactEmail;

  return payload;
};

const mapHelpRequestToForm = (helpRequest) => ({
  title: helpRequest?.title || '',
  story: helpRequest?.story || '',
  category: helpRequest?.category || '',
  location:
    helpRequest?.location?.coordinates?.length === 2
      ? {
          type: 'Point',
          coordinates: helpRequest.location.coordinates,
          address: helpRequest.location.address || '',
        }
      : null,
  urgencyLevel: helpRequest?.urgencyLevel || 'MEDIUM',
  amountNeeded: helpRequest?.amountNeeded || 0,
  evidences: Array.isArray(helpRequest?.evidences)
    ? helpRequest.evidences.map((item) => ({
        url: item.url,
        publicId: item.publicId || '',
        mediaType: item.mediaType || 'image',
        originalName: item.originalName || '',
      }))
    : [],
  contactPhone: helpRequest?.contactPhone || '',
  contactEmail: helpRequest?.contactEmail || '',
});

export function EditHelpRequestPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUserId = useAuthStore(authSelectors.userId);

  const { data: helpRequest, isLoading, isError, error } = useHelpRequestDetail(id);
  const updateMutation = useUpdateHelpRequest();
  const deleteMutation = useDeleteHelpRequest();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(helpRequestSchema),
    defaultValues: defaultHelpRequestValues,
  });

  useEffect(() => {
    if (helpRequest) {
      reset(mapHelpRequestToForm(helpRequest));
    }
  }, [helpRequest, reset]);

  const requesterId =
    typeof helpRequest?.requesterId === 'object'
      ? (helpRequest.requesterId?._id || helpRequest.requesterId?.id)
      : helpRequest?.requesterId;

  const isOwner = Boolean(
    currentUserId && requesterId && currentUserId.toString() === requesterId.toString()
  );

  const onSubmit = async (data) => {
    if (!id) {
      return;
    }

    await updateMutation.mutateAsync({ id, data: buildPayload(data) });
    navigate(`/need-help/${id}`);
  };

  const handleDelete = () => {
    if (!helpRequest?._id) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this help request? This action cannot be undone.'
    );

    if (confirmed) {
      deleteMutation.mutate(helpRequest._id);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white py-20 shadow-sm">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      </main>
    );
  }

  if (isError || !helpRequest) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <CircleAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Cannot edit this request</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            {error?.message || 'The request does not exist or is no longer available.'}
          </p>
          <Link
            to={ROUTES.NEED_HELP}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-amber-500"
          >
            <ArrowLeft size={18} />
            Back to Help Requests
          </Link>
        </div>
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <CircleAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Permission denied</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            You can only edit your own help requests.
          </p>
          <Link
            to={ROUTES.NEED_HELP}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-amber-500"
          >
            <ArrowLeft size={18} />
            Back to Help Requests
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          to={`/need-help/${helpRequest._id}`}
          className="mb-4 inline-flex items-center gap-2 font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Request Detail
        </Link>

        <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          Edit Help Request
        </h1>
        <p className="mt-3 text-base text-slate-500 sm:text-lg">
          Update your story, evidence, and contact information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Basic Details">
          <div className="space-y-6">
            <FormField label="Request Title" error={errors.title?.message} required>
              <input
                {...register('title')}
                placeholder="e.g., Emergency Medical Support Needed"
                className={getInputClass(!!errors.title)}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

        <FormSection title="Funding Goal">
          <FormField label="Amount Needed (VND)" error={errors.amountNeeded?.message}>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="font-medium text-slate-400">₫</span>
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
          <p className="mt-3 text-xs text-slate-500">
            Upload photos, videos, or official documents. Max 10 files.
          </p>
        </FormSection>

        <FormSection title="Contact Information">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || updateMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Trash2 size={16} />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Request'}
          </button>

          <Button
            type="submit"
            variant="yellow"
            size="lg"
            className="rounded-2xl shadow-lg shadow-amber-500/20 sm:min-w-[220px]"
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </main>
  );
}

export default EditHelpRequestPage;
