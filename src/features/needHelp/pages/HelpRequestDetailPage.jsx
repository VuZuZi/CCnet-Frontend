import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Expand,
  FolderKanban,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from 'lucide-react';

import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

import { HelpRequestFundingCard } from '../components/detail/HelpRequestFundingCard';
import { HelpRequestVerification } from '../components/detail/HelpRequestVerification';
import { EvidenceGallery } from '../components/detail/EvidenceGallery';
import { AdminAssignmentPanel } from '../components/admin/AdminAssignmentPanel';
import { RoleUpgradeModal } from '../components/RoleUpgradeModal';
import { useHelpRequestDetail } from '../hooks/useHelpRequestQueries';
import {
  useDeleteHelpRequest,
  useRespondHelpRequestAssignment,
} from '../hooks/useHelpRequestMutations';
import {
  HELP_REQUEST_CATEGORIES,
  URGENCY_LEVELS,
} from '../validations/helpRequestSchema';

const CATEGORY_LABELS = Object.fromEntries(
  HELP_REQUEST_CATEGORIES.map((item) => [item.value, item.label])
);

const URGENCY_LABELS = Object.fromEntries(
  URGENCY_LEVELS.map((item) => [item.value, item.label])
);

function getEntityId(value) {
  if (!value) return null;

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value._id || value.id || null;
  }

  return value;
}

function getPopulatedEntity(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function getHelpRequestImage(helpRequest) {
  if (!helpRequest) return '';

  if (typeof helpRequest.coverImage === 'string' && helpRequest.coverImage.trim()) {
    return helpRequest.coverImage;
  }

  if (typeof helpRequest.image === 'string' && helpRequest.image.trim()) {
    return helpRequest.image;
  }

  if (Array.isArray(helpRequest.images) && helpRequest.images.length > 0) {
    const firstImage = helpRequest.images[0];
    if (typeof firstImage === 'string' && firstImage.trim()) return firstImage;
    if (typeof firstImage?.url === 'string' && firstImage.url.trim()) return firstImage.url;
    if (typeof firstImage?.secure_url === 'string' && firstImage.secure_url.trim()) {
      return firstImage.secure_url;
    }
  }

  if (Array.isArray(helpRequest.evidences) && helpRequest.evidences.length > 0) {
    const firstEvidence = helpRequest.evidences.find(
      (item) => item?.mediaType === 'image' || !item?.mediaType
    );

    if (typeof firstEvidence === 'string' && firstEvidence.trim()) return firstEvidence;
    if (typeof firstEvidence?.url === 'string' && firstEvidence.url.trim()) {
      return firstEvidence.url;
    }
    if (
      typeof firstEvidence?.secure_url === 'string' &&
      firstEvidence.secure_url.trim()
    ) {
      return firstEvidence.secure_url;
    }
  }

  return '';
}

function getInitials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'CC'
  );
}

function InfoBadge({ children, tone = 'default' }) {
  const styles = {
    default: 'border-[#e7dfcf] bg-[#fcfaf5] text-slate-700',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function MetaChip({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#e7dfcf] bg-[#faf8f2] px-4 py-2.5 text-sm font-medium text-slate-600">
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <span className="min-w-0 whitespace-pre-wrap break-all">{children}</span>
    </div>
  );
}

function ContactRow({ icon: Icon, children, href }) {
  const content = (
    <div className="flex items-center gap-3 rounded-2xl border border-[#ebe5d8] bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-amber-300 hover:shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Icon className="h-4 w-4" />
      </div>
      <span className="min-w-0 whitespace-pre-wrap break-all">{children}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

function SectionCard({ eyebrow, title, children }) {
  return (
    <section className="rounded-[28px] border border-[#ece7dc] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="mb-5">
        <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ImagePreviewModal({ isOpen, imageUrl, title, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/45"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem trước ảnh"
    >
      <div className="flex h-screen w-screen items-center justify-center p-3">
        <img
          src={imageUrl}
          alt={title}
          onClick={(event) => event.stopPropagation()}
          className="h-[86vh] w-auto max-w-[92vw] object-contain shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
        />
      </div>
    </div>
  );
}

function OrganizerActionCard({
  title,
  description,
  buttonLabel,
  onAction,
  disabled = false,
  isPending = false,
}) {
  return (
    <section className="rounded-[28px] border border-amber-200 bg-[#fff9eb] p-6 shadow-sm">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
        <CheckCircle2 size={13} />
        Host NeedHelp
      </div>

      <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>

      <button
        type="button"
        onClick={onAction}
        disabled={disabled || isPending}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <FolderKanban size={16} />}
        {buttonLabel}
      </button>
    </section>
  );
}

export function HelpRequestDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isRoleUpgradeOpen, setIsRoleUpgradeOpen] = useState(false);

  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const currentUserRole = useAuthStore(authSelectors.userRole);
  const currentUserId = useAuthStore(authSelectors.userId);

  const { data: helpRequest, isLoading, isError, error } = useHelpRequestDetail(id);
  const deleteMutation = useDeleteHelpRequest();
  const respondMutation = useRespondHelpRequestAssignment();

  const isAdmin = currentUserRole === 'admin';
  const isOrganizer = currentUserRole === 'organizer';
  const backTo = location.state?.backTo;

  const requesterId = getEntityId(helpRequest?.requesterId);
  const isOwner = Boolean(
    currentUserId && requesterId && String(currentUserId) === String(requesterId)
  );

  const handleBack = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(backTo || ROUTES.NEED_HELP, { replace: true });
  };

  const handleDelete = () => {
    if (!helpRequest?._id) return;

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa yêu cầu trợ giúp này không? Hành động này không thể hoàn tác.'
    );

    if (confirmed) {
      deleteMutation.mutate(helpRequest._id);
    }
  };

  const handleRoleUpgradeConfirm = () => {
    setIsRoleUpgradeOpen(false);

    if (!isAuthenticated) {
      navigate(ROUTES.REGISTER, {
        state: {
          from: location,
          intendedPath: `${ROUTES.NEED_HELP}/${id}`,
          nextAfterAuth: ROUTES.ORGANIZER_APPLY,
        },
      });
      return;
    }

    navigate(ROUTES.ORGANIZER_APPLY, {
      state: {
        from: location,
        intendedPath: `${ROUTES.NEED_HELP}/${id}`,
      },
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f7f3]">
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-[#ece7dc] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-amber-500" size={34} />
              <p className="text-sm font-medium text-slate-500">Đang tải yêu cầu trợ giúp...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !helpRequest) {
    return (
      <main className="min-h-screen bg-[#f8f7f3]">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#ece7dc] bg-white px-6 py-20 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <CircleAlert size={28} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy yêu cầu trợ giúp</h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              {error?.message ||
                'Yêu cầu bạn đang tìm không tồn tại hoặc không còn khả dụng.'}
            </p>

            <button
              type="button"
              onClick={handleBack}
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e7b10a] bg-[#f4b400] px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(244,180,0,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#e0a800] focus:outline-none focus:ring-2 focus:ring-[#f4b400]/50"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
          </div>
        </div>
      </main>
    );
  }

  const requester = getPopulatedEntity(helpRequest.requesterId);
  const assignedOrganizer = getPopulatedEntity(helpRequest.assignedOrganizerId);
  const linkedProject = getPopulatedEntity(helpRequest.linkedProjectId);
  const linkedProjectId = getEntityId(helpRequest.linkedProjectId);
  const assignedOrganizerId = getEntityId(helpRequest.assignedOrganizerId);

  const imageUrl = getHelpRequestImage(helpRequest);
  const title = helpRequest.title || 'Yêu cầu trợ giúp không có tiêu đề';
  const description = helpRequest.description?.trim() || '';
  const storyText = helpRequest.story?.trim() || '';
  const leadText = description && description !== storyText ? description : '';
  const requesterName =
    requester?.name ||
    requester?.fullName ||
    helpRequest.requesterName ||
    'Người dùng ẩn danh';
  const requesterEmail =
    helpRequest.contactEmail ||
    requester?.email ||
    'Không cung cấp email liên hệ';
  const requesterPhone =
    helpRequest.contactPhone || 'Không cung cấp số điện thoại';
  const assignedOrganizerName =
    assignedOrganizer?.fullName ||
    assignedOrganizer?.name ||
    'một nhà tổ chức khác';

  const categoryValue =
    helpRequest.category || helpRequest.requestType || helpRequest.type || 'KHAC';
  const urgencyValue =
    helpRequest.urgencyLevel || helpRequest.urgency || helpRequest.priority || 'MEDIUM';
  const category = CATEGORY_LABELS[categoryValue] || categoryValue || 'Cần trợ giúp';
  const urgency = URGENCY_LABELS[urgencyValue] || urgencyValue || 'Trung bình';
  const locationText =
    helpRequest.locationText ||
    helpRequest.location?.address ||
    helpRequest.address ||
    'Địa điểm đang cập nhật';
  const submittedAt = helpRequest.createdAt
    ? new Date(helpRequest.createdAt).toLocaleDateString('vi-VN')
    : 'Được gửi gần đây';
  const urgencyTone =
    urgencyValue === 'CRITICAL' || urgencyValue === 'HIGH'
      ? 'rose'
      : urgencyValue === 'LOW'
        ? 'default'
        : 'blue';

  const isAssignedToCurrentOrganizer = Boolean(
    currentUserId &&
      assignedOrganizerId &&
      String(currentUserId) === String(assignedOrganizerId)
  );
  const isAssignedToAnotherOrganizer = Boolean(
    assignedOrganizerId && !isAssignedToCurrentOrganizer
  );
  const canAcceptAssignedAndCreate =
    isOrganizer &&
    isAssignedToCurrentOrganizer &&
    helpRequest.status === 'VERIFIED' &&
    !linkedProjectId;
  const canCreateProjectFromAssignedRequest =
    isOrganizer &&
    isAssignedToCurrentOrganizer &&
    helpRequest.status === 'IN_PROGRESS' &&
    !linkedProjectId;
  const canCreateProjectDirectly =
    isOrganizer &&
    !assignedOrganizerId &&
    helpRequest.status === 'VERIFIED' &&
    !linkedProjectId;

  const shouldShowHostActionCard =
    !isAdmin &&
    (Boolean(linkedProjectId) ||
      helpRequest.status === 'VERIFIED' ||
      isAssignedToCurrentOrganizer ||
      isAssignedToAnotherOrganizer);

  let hostActionTitle = 'Tổ chức chiến dịch từ yêu cầu này';
  let hostActionDescription =
    'CCNet sẽ mang dữ liệu của yêu cầu này sang trang tạo dự án để bạn tiếp tục xử lý.';
  let hostActionLabel = 'Tổ chức chiến dịch này';
  let hostActionDisabled = false;

  if (linkedProjectId) {
    hostActionTitle = 'Yêu cầu này đã được tiếp nhận';
    hostActionDescription =
      'Yêu cầu này đã được chuyển thành dự án. Bạn có thể mở dự án liên kết để theo dõi.';
    hostActionLabel = 'Xem dự án liên kết';
  } else if (canAcceptAssignedAndCreate) {
    hostActionTitle = 'Bạn đã được giao yêu cầu này';
    hostActionDescription =
      'Chấp nhận giao việc và chuyển thẳng sang tạo dự án với dữ liệu NeedHelp đã điền sẵn.';
    hostActionLabel = 'Chấp nhận và tạo dự án';
  } else if (canCreateProjectFromAssignedRequest) {
    hostActionTitle = 'Tiếp tục xử lý yêu cầu này';
    hostActionDescription =
      'Yêu cầu này đang do bạn phụ trách. Bạn có thể tạo dự án ngay từ dữ liệu hiện có.';
    hostActionLabel = 'Tạo dự án từ yêu cầu';
  } else if (isAssignedToAnotherOrganizer) {
    hostActionTitle = 'Yêu cầu này đang có nhà tổ chức phụ trách';
    hostActionDescription = `${assignedOrganizerName} đang xử lý yêu cầu này trên CCNet.`;
    hostActionLabel = 'Đã có nhà tổ chức phụ trách';
    hostActionDisabled = true;
  } else if (!isOrganizer) {
    hostActionTitle = 'Muốn đứng ra tổ chức chiến dịch này?';
    hostActionDescription = isAuthenticated
      ? 'Bạn cần quyền nhà tổ chức để tiếp nhận yêu cầu này và tạo chiến dịch từ đó.'
      : 'Bạn cần tài khoản và quyền nhà tổ chức để tiếp nhận yêu cầu này và tạo chiến dịch từ đó.';
    hostActionLabel = 'Đăng ký để tổ chức';
  }

  const handleHostAction = async () => {
    if (!helpRequest?._id || hostActionDisabled || respondMutation.isPending) {
      return;
    }

    if (linkedProjectId) {
      navigate(`/projects/${linkedProjectId}`);
      return;
    }

    if (!isOrganizer) {
      setIsRoleUpgradeOpen(true);
      return;
    }

    if (canAcceptAssignedAndCreate) {
      await respondMutation.mutateAsync({
        id: helpRequest._id,
        action: 'accept',
      });
    }

    if (
      canAcceptAssignedAndCreate ||
      canCreateProjectFromAssignedRequest ||
      canCreateProjectDirectly
    ) {
      navigate(`${ROUTES.PROJECT_CREATE}?helpRequestId=${helpRequest._id}`);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#f8f7f3]">
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e7b10a] bg-[#f4b400] px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(244,180,0,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#e0a800] focus:outline-none focus:ring-2 focus:ring-[#f4b400]/50"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>

            {isOwner ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/need-help/${helpRequest._id}/edit`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#f1d58a] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#fff8e6]"
                >
                  <Pencil size={16} />
                  Chỉnh sửa
                </Link>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Trash2 size={16} />
                  {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa yêu cầu'}
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            {isAdmin ? <AdminAssignmentPanel helpRequest={helpRequest} /> : null}

            <section className="rounded-[32px] border border-[#ece7dc] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-8">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <InfoBadge>{category}</InfoBadge>
                    <InfoBadge tone={urgencyTone}>{urgency}</InfoBadge>
                    <MetaChip icon={MapPin}>{locationText}</MetaChip>
                    <MetaChip icon={CalendarDays}>{submittedAt}</MetaChip>
                  </div>

                  <h1 className="mt-5 max-w-4xl break-words text-[clamp(2rem,4vw,3.2rem)] font-black leading-[1.08] tracking-tight text-slate-950">
                    {title}
                  </h1>

                  {leadText ? (
                    <p className="mt-4 max-w-3xl whitespace-pre-wrap break-words text-[17px] leading-8 text-slate-600">
                      {leadText}
                    </p>
                  ) : null}

                  {imageUrl ? (
                    <div className="mt-6 rounded-[28px] border border-[#ebe5d8] bg-[#fcfbf8] p-5 sm:p-6">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#8b7b5e]">
                          Hình ảnh đính kèm
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsImagePreviewOpen(true)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#e7dfcf] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Expand className="h-3.5 w-3.5" />
                          Phóng to
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsImagePreviewOpen(true)}
                        className="group block w-full overflow-hidden rounded-[24px] border border-[#ebe5d8] bg-[#f8f3e8] text-left transition hover:border-amber-300"
                      >
                        <div className="flex min-h-[320px] items-center justify-center px-4 py-4 sm:min-h-[420px] sm:px-6 sm:py-6">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="max-h-[420px] w-full rounded-[18px] object-contain shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition duration-300 group-hover:scale-[1.015]"
                          />
                        </div>
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  {shouldShowHostActionCard ? (
                    <OrganizerActionCard
                      title={hostActionTitle}
                      description={hostActionDescription}
                      buttonLabel={hostActionLabel}
                      onAction={handleHostAction}
                      disabled={hostActionDisabled}
                      isPending={respondMutation.isPending}
                    />
                  ) : null}

                  <section className="rounded-[28px] border border-[#ebe5d8] bg-[#fcfbf8] p-6">
                    <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.24em] text-[#8b7b5e]">
                      Người gửi yêu cầu
                    </div>

                    <div className="flex items-center gap-4">
                      {requester?.avatar ? (
                        <img
                          src={requester.avatar}
                          alt={requesterName}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-base font-bold text-amber-700">
                          {getInitials(requesterName)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="break-all text-xl font-semibold text-slate-900">
                          {requesterName}
                        </div>
                        <div className="mt-1 break-all text-sm text-slate-500">
                          {requesterEmail}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-[#ebe5d8] bg-[#fcfbf8] p-6">
                    <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.24em] text-[#8b7b5e]">
                      Liên hệ nhanh
                    </div>

                    <div className="space-y-3">
                      <ContactRow
                        icon={Phone}
                        href={
                          requesterPhone !== 'Không cung cấp số điện thoại'
                            ? `tel:${requesterPhone}`
                            : undefined
                        }
                      >
                        {requesterPhone}
                      </ContactRow>

                      <ContactRow
                        icon={Mail}
                        href={
                          requesterEmail !== 'Không cung cấp email liên hệ'
                            ? `mailto:${requesterEmail}`
                            : undefined
                        }
                      >
                        {requesterEmail}
                      </ContactRow>
                    </div>
                  </section>

                  {linkedProject ? (
                    <section className="rounded-[28px] border border-[#ebe5d8] bg-white p-6 shadow-sm">
                      <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.24em] text-slate-400">
                        <FolderKanban size={14} />
                        Dự án liên kết
                      </div>

                      <Link
                        to={`/projects/${linkedProject._id || linkedProject.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition-colors hover:text-amber-700"
                      >
                        {linkedProject.title || 'Mở dự án liên kết'}
                      </Link>
                    </section>
                  ) : null}

                  <HelpRequestFundingCard amountNeeded={helpRequest.amountNeeded} />
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-6">
                {storyText ? (
                  <SectionCard eyebrow="Câu chuyện" title="Hoàn cảnh cần hỗ trợ">
                    <div className="space-y-4 text-[15px] leading-8 text-slate-700">
                      {storyText
                        .split('\n')
                        .map((paragraph) => paragraph.trim())
                        .filter(Boolean)
                        .map((paragraph, index) => (
                          <p
                            key={`${index}-${paragraph.slice(0, 20)}`}
                            className="break-words whitespace-pre-wrap"
                          >
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </SectionCard>
                ) : null}

                {Array.isArray(helpRequest.evidences) && helpRequest.evidences.length > 0 ? (
                  <SectionCard eyebrow="Minh chứng" title="Tệp người gửi đã cung cấp">
                    <EvidenceGallery evidences={helpRequest.evidences} />
                  </SectionCard>
                ) : null}
              </div>

              <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                <HelpRequestVerification
                  helpRequest={helpRequest}
                  showEvidence={false}
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        imageUrl={imageUrl}
        title={title}
        onClose={() => setIsImagePreviewOpen(false)}
      />

      <RoleUpgradeModal
        isOpen={isRoleUpgradeOpen}
        onAssignNow={handleRoleUpgradeConfirm}
        onLater={() => setIsRoleUpgradeOpen(false)}
        title={!isAuthenticated ? 'Đăng ký để tổ chức chiến dịch' : 'Cần quyền nhà tổ chức'}
        description={
          !isAuthenticated
            ? 'Bạn cần một tài khoản và vai trò nhà tổ chức để đứng ra host yêu cầu này.'
            : 'Chỉ nhà tổ chức mới có thể host yêu cầu này và chuyển nó thành dự án.'
        }
        confirmLabel="Đăng ký ngay"
      />
    </>
  );
}

export default HelpRequestDetailPage;
