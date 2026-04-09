import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, FileText, MapPin, ImageIcon, Phone, DollarSign, AlertTriangle } from 'lucide-react';
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
import { FormField, getInputClass } from '../components/form/FormField';
import { SelectField } from '../components/form/SelectField';

// ── Reusable section card ──
function SectionCard({ icon: Icon, title, children, accent = 'amber' }) {
  const accentMap = {
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    sky:     'bg-sky-50 text-sky-600 border-sky-100',
    rose:    'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    violet:  'bg-violet-50 text-violet-600 border-violet-100',
  };
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 sm:px-8">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accentMap[accent]}`}>
          <Icon size={17} />
        </span>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-6 sm:p-8">{children}</div>
    </div>
  );
}

const URGENCY_SELECTED = {
  LOW:      'border-slate-400 bg-slate-50 text-slate-700',
  MEDIUM:   'border-blue-400 bg-blue-50 text-blue-700',
  HIGH:     'border-orange-400 bg-orange-50 text-orange-700',
  CRITICAL: 'border-red-400 bg-red-50 text-red-700',
};

const URGENCY_UNSELECTED = 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600';

export function CreateHelpRequestPage() {
  const createMutation = useCreateHelpRequest();
  const [amountDisplay, setAmountDisplay] = useState('');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(helpRequestSchema),
    defaultValues: defaultHelpRequestValues,
  });

  const urgencyLevel = watch('urgencyLevel');

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    const formatted = numericValue ? new Intl.NumberFormat('vi-VN').format(numericValue) : '';
    setAmountDisplay(formatted);
    setValue('amountNeeded', numericValue, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      story: data.story,
      category: data.category,
      urgencyLevel: data.urgencyLevel,
      amountNeeded: data.amountNeeded || 0,
    };

    if (data.location?.coordinates?.length === 2) {
      payload.location = {
        type: 'Point',
        coordinates: data.location.coordinates,
        address: data.location.address || '',
      };
    }

    if (data.evidences?.length > 0) {
      payload.evidences = data.evidences.map((e) => ({
        url: e.url,
        publicId: e.publicId || '',
        mediaType: e.url?.match(/\.(mp4|webm|mov)$/i) ? 'video'
                 : e.url?.match(/\.(pdf|doc|docx)$/i) ? 'document' : 'image',
        originalName: e.originalName || '',
      }));
    }

    if (data.contactPhone) payload.contactPhone = data.contactPhone;
    if (data.contactEmail) payload.contactEmail = data.contactEmail;

    createMutation.mutate(payload);
  };

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 pb-20 pt-8 sm:px-6 lg:px-8">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <Link
          to="/need-help"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Help Requests
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Create a Help Request
          </h1>
          <p className="text-base text-slate-500">
            Share your story and provide evidence to find a supporting organization.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ── 2-column layout on lg screens ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">

          {/* ════ LEFT COLUMN — 2/3 ════ */}
          <div className="space-y-6 lg:col-span-2">

            {/* Basic Details */}
            <SectionCard icon={FileText} title="Basic Details" accent="amber">
              <div className="space-y-5">
                <FormField label="Request Title" error={errors.title?.message} required>
                  <input
                    {...register('title')}
                    placeholder="e.g., Emergency Medical Support Needed for Family of 4"
                    className={getInputClass(!!errors.title)}
                  />
                  <p className="mt-1 text-xs text-slate-400">10–200 characters</p>
                </FormField>

                <SelectField
                  label="Category"
                  options={HELP_REQUEST_CATEGORIES}
                  error={errors.category?.message}
                  required
                  placeholder="Select a Category"
                  {...register('category')}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Urgency Level
                  </label>
                  <div className="flex gap-2">
                    {URGENCY_LEVELS.map((u) => (
                      <label
                        key={u.value}
                        className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border-2 py-2.5 text-xs font-bold transition-colors ${
                          urgencyLevel === u.value
                            ? URGENCY_SELECTED[u.value]
                            : URGENCY_UNSELECTED
                        }`}
                      >
                        <input
                          type="radio"
                          value={u.value}
                          {...register('urgencyLevel')}
                          className="sr-only"
                        />
                        {u.label}
                      </label>
                    ))}
                  </div>
                  {errors.urgencyLevel && (
                    <p className="mt-1.5 text-sm font-medium text-red-500">{errors.urgencyLevel.message}</p>
                  )}
                  {/* Urgency warning — inside card, không gây layout shift */}
                  {(urgencyLevel === 'HIGH' || urgencyLevel === 'CRITICAL') && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-orange-200 bg-orange-50 p-3">
                      <AlertTriangle size={15} className="mt-0.5 flex-shrink-0 text-orange-500" />
                      <p className="min-w-0 text-xs text-orange-700 leading-relaxed">
                        <span className="font-bold">
                          {urgencyLevel === 'CRITICAL' ? 'Critical — ' : 'High urgency — '}
                        </span>
                        {urgencyLevel === 'CRITICAL'
                          ? 'Sẽ được ưu tiên xem xét ngay lập tức.'
                          : 'Được xem xét trong vòng 24 giờ.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Story */}
            <SectionCard icon={FileText} title="Story & Situation" accent="violet">
              <FormField label="Your Story" error={errors.story?.message} required>
                <textarea
                  {...register('story')}
                  rows={9}
                  placeholder="Describe the situation in detail — who needs help, what happened, why it's urgent, and how the support will be used..."
                  className={`${getInputClass(!!errors.story)} resize-y min-h-[200px]`}
                />
                <p className="mt-1 text-xs text-slate-400">At least 50 characters. Be as detailed as possible.</p>
              </FormField>
            </SectionCard>

            {/* Evidence & Visuals */}
            <SectionCard icon={ImageIcon} title="Evidence & Visuals" accent="sky">
              <FormField
                label="Upload photos, videos, or documents"
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
              <p className="mt-3 text-xs text-slate-400">
                JPG, PNG, WEBP, MP4, PDF — max 10 files. Clear photos significantly increase your chances.
              </p>
            </SectionCard>
          </div>

          {/* ════ RIGHT SIDEBAR — 1/3 ════ */}
          <div className="space-y-6 lg:col-span-1">

            {/* Location */}
            <SectionCard icon={MapPin} title="Location" accent="emerald">
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
            </SectionCard>

            {/* Funding Goal */}
            <SectionCard icon={DollarSign} title="Funding Goal" accent="amber">
              <FormField label="Amount Needed (VND)" error={errors.amountNeeded?.message}>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-base font-bold text-slate-400">₫</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className={`${getInputClass(!!errors.amountNeeded)} pl-8`}
                  />
                  <input type="hidden" {...register('amountNeeded')} />
                </div>
                {amountDisplay ? (
                  <p className="mt-1.5 text-xs font-semibold text-amber-600">
                    = {amountDisplay} đồng
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">Leave 0 for flexible support</p>
                )}
              </FormField>
            </SectionCard>

            {/* Contact Information */}
            <SectionCard icon={Phone} title="Contact Information" accent="sky">
              <div className="space-y-5">
                <FormField label="Phone Number" error={errors.contactPhone?.message}>
                  <input
                    type="tel"
                    {...register('contactPhone')}
                    placeholder="0912345678"
                    className={getInputClass(!!errors.contactPhone)}
                  />
                  <p className="mt-1 text-xs text-slate-400">Vietnamese format only (optional)</p>
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
            </SectionCard>

          </div>
        </div>

        {/* ── Submit — full width bên ngoài grid ── */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <Button
            type="submit"
            variant="yellow"
            size="lg"
            className="w-full max-w-md rounded-2xl shadow-lg shadow-amber-500/25 text-base font-bold"
            isLoading={createMutation.isPending}
          >
            Submit Help Request
          </Button>
          <p className="text-xs text-slate-400">
            Your request will be reviewed before going live.
          </p>
        </div>
      </form>
    </main>
  );
}

export default CreateHelpRequestPage;
