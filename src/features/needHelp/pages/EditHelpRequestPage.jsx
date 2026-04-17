import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CircleAlert, DollarSign, FileText, ImageIcon, Loader2, MapPin, Phone, AlertTriangle, Trash2 } from 'lucide-react';
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
import { FormField, getInputClass } from '../components/form/FormField';
import { SelectField } from '../components/form/SelectField';

// ── Same SectionCard as CreatePage ──
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

const buildPayload = (data) => {
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
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(helpRequestSchema),
    defaultValues: defaultHelpRequestValues,
  });

  const urgencyLevel = watch('urgencyLevel');
  const [amountDisplay, setAmountDisplay] = useState('');

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    const formatted = numericValue ? new Intl.NumberFormat('vi-VN').format(numericValue) : '';
    setAmountDisplay(formatted);
    setValue('amountNeeded', numericValue, { shouldValidate: true });
  };

  useEffect(() => {
    if (helpRequest) {
      const formData = mapHelpRequestToForm(helpRequest);
      reset(formData);
      if (formData.amountNeeded > 0) {
        setAmountDisplay(new Intl.NumberFormat('vi-VN').format(formData.amountNeeded));
      }
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
    if (!id) return;
    await updateMutation.mutateAsync({ id, data: buildPayload(data) });
    navigate(`/need-help/${id}`);
  };

  const handleDelete = () => {
    if (!helpRequest?._id) return;
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa yêu cầu trợ giúp này không? Hành động này không thể hoàn tác.'
    );
    if (confirmed) deleteMutation.mutate(helpRequest._id);
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white py-20 shadow-sm">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      </main>
    );
  }

  if (isError || !helpRequest) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <CircleAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Không thể chỉnh sửa yêu cầu này</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            {error?.message || 'Yêu cầu không tồn tại hoặc không còn khả dụng.'}
          </p>
          <Link
            to={ROUTES.NEED_HELP}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-amber-500"
          >
            <ArrowLeft size={18} />
            Quay lại yêu cầu trợ giúp
          </Link>
        </div>
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <CircleAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Quyền truy cập bị từ chối</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Bạn chỉ có thể chỉnh sửa các yêu cầu trợ giúp của riêng bạn.
          </p>
          <Link
            to={ROUTES.NEED_HELP}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-amber-500"
          >
            <ArrowLeft size={18} />
            Quay lại yêu cầu trợ giúp
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 pb-20 pt-8 sm:px-6 lg:px-8">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <Link
          to={`/need-help/${helpRequest._id}`}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Quay lại chi tiết yêu cầu
        </Link>
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          Chỉnh sửa yêu cầu trợ giúp
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Cập nhật câu chuyện, bằng chứng và thông tin liên hệ của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">

          {/* ════ LEFT COLUMN — 2/3 ════ */}
          <div className="space-y-6 lg:col-span-2">

            {/* Basic Details */}
            <SectionCard icon={FileText} title="Thông tin cơ bản" accent="amber">
              <div className="space-y-5">
                <FormField label="Tiêu đề yêu cầu" error={errors.title?.message} required>
                  <input
                    {...register('title')}
                    placeholder="ví dụ: Cần hỗ trợ y tế khẩn cấp"
                    className={getInputClass(!!errors.title)}
                  />
                </FormField>

                <SelectField
                  label="Danh mục"
                  options={HELP_REQUEST_CATEGORIES}
                  error={errors.category?.message}
                  required
                  placeholder="Chọn một danh mục"
                  {...register('category')}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Mức độ ưu tiên
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
                  {/* Urgency warning — inside urgency div, clipped by SectionCard overflow-hidden */}
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
            <SectionCard icon={FileText} title="Câu chuyện & Tình huống" accent="violet">
              <FormField label="Câu chuyện / Mô tả" error={errors.story?.message} required>
                <textarea
                  {...register('story')}
                  rows={9}
                  placeholder="Mô tả chi tiết tình huống..."
                  className={`${getInputClass(!!errors.story)} resize-y min-h-[200px]`}
                />
              </FormField>
            </SectionCard>

            {/* Evidence */}
            <SectionCard icon={ImageIcon} title="Bằng chứng & Hình ảnh" accent="sky">
              <FormField
                label="Tải lên ảnh, video hoặc tài liệu làm bằng chứng"
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
              <p className="mt-3 text-xs text-slate-400">Upload photos, videos, or documents. Max 10 files.</p>
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
                  <p className="mt-1 text-xs text-slate-400">Để 0 cho hỗ trợ linh hoạt</p>
                )}
              </FormField>
            </SectionCard>

            {/* Contact */}
            <SectionCard icon={Phone} title="Thông tin liên hệ" accent="sky">
              <div className="space-y-5">
                <FormField label="Số điện thoại" error={errors.contactPhone?.message}>
                  <input
                    type="tel"
                    {...register('contactPhone')}
                    placeholder="0912345678 hoặc +84912345678"
                    className={getInputClass(!!errors.contactPhone)}
                  />
                  <p className="mt-1 text-xs text-slate-400">Định dạng Việt Nam (tùy chọn)</p>
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

        {/* ── Actions — full width bên ngoài grid ── */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            type="submit"
            variant="yellow"
            size="lg"
            className="w-full max-w-xs rounded-2xl shadow-lg shadow-amber-500/25 text-base font-bold"
            isLoading={updateMutation.isPending}
          >
            Lưu thay đổi
          </Button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || updateMutation.isPending}
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Trash2 size={15} />
            {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa yêu cầu'}
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditHelpRequestPage;
