import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CircleAlert,
  Loader2,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Expand,
} from 'lucide-react';

import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

import { HelpRequestFundingCard } from '../components/detail/HelpRequestFundingCard';
import { HelpRequestVerification } from '../components/detail/HelpRequestVerification';
import { useHelpRequestDetail } from '../hooks/useHelpRequestQueries';
import { useDeleteHelpRequest } from '../hooks/useHelpRequestMutations';
import { AdminAssignmentPanel } from '../components/admin/AdminAssignmentPanel';

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
    const firstEvidence = helpRequest.evidences[0];
    if (typeof firstEvidence === 'string' && firstEvidence.trim()) return firstEvidence;
    if (typeof firstEvidence?.url === 'string' && firstEvidence.url.trim()) return firstEvidence.url;
    if (
      typeof firstEvidence?.secure_url === 'string' &&
      firstEvidence.secure_url.trim()
    ) {
      return firstEvidence.secure_url;
    }
  }

  return '';
}

function InfoBadge({ children, tone = 'default' }) {
  const styles = {
    default: 'border-[#e7dfcf] bg-[#fcfaf5] text-slate-700',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
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

function ImagePreviewModal({ isOpen, imageUrl, title, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

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
      aria-label="Image preview"
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

export function HelpRequestDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const currentUserRole = useAuthStore(authSelectors.userRole);
  const currentUserId = useAuthStore(authSelectors.userId);

  const { data: helpRequest, isLoading, isError, error } = useHelpRequestDetail(id);
  const deleteMutation = useDeleteHelpRequest();

  const backTo = location.state?.backTo;
  const isAdmin = currentUserRole === 'admin';

  const requesterId =
    typeof helpRequest?.requesterId === 'object'
      ? helpRequest.requesterId?._id || helpRequest.requesterId?.id
      : helpRequest?.requesterId;

  const isOwner = Boolean(
    currentUserId && requesterId && currentUserId.toString() === requesterId.toString()
  );

  const handleDelete = () => {
    if (!helpRequest?._id) return;

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa yêu cầu trợ giúp này không? Hành động này không thể hoàn tác.'
    );

    if (confirmed) {
      deleteMutation.mutate(helpRequest._id);
    }
  };

  const handleBack = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(backTo || ROUTES.NEED_HELP, { replace: true });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f7f3]">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
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
              className="relative isolate z-[9999] mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e7b10a] bg-[#f4b400] px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(244,180,0,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#e0a800] focus:outline-none focus:ring-2 focus:ring-[#f4b400]/50"
              style={{ pointerEvents: 'auto' }}
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
          </div>
        </div>
      </main>
    );
  }

  const imageUrl = getHelpRequestImage(helpRequest);
  const requester =
    typeof helpRequest.requesterId === 'object' ? helpRequest.requesterId : null;

  const title = helpRequest.title || 'Yêu cầu trợ giúp không có tiêu đề';
  const description =
    helpRequest.description ||
    'Yêu cầu này được hiển thị cho cộng đồng để các nhà tổ chức và những người muốn hỗ trợ có thể xem xét trường hợp, xác minh thông tin và phản hồi một cách có trách nhiệm.';

  const requesterName = requester?.name || requester?.fullName || 'Người dùng ẩn danh';
  const requesterEmail =
    helpRequest.contactEmail || requester?.email || 'Không cung cấp email liên hệ';
  const requesterPhone = helpRequest.contactPhone || 'Không cung cấp số điện thoại';

  const category =
    helpRequest.category || helpRequest.requestType || helpRequest.type || 'Cần trợ giúp';

  const urgency =
    helpRequest.urgency || helpRequest.priority || helpRequest.severity || 'Trung bình';

  const locationText =
    helpRequest.locationText ||
    helpRequest.location?.address ||
    helpRequest.address ||
    'Vị trí sẽ xác định';

  const submittedAt = helpRequest.createdAt
    ? new Date(helpRequest.createdAt).toLocaleDateString('vi-VN')
    : 'Được gửi gần đây';

  return (
    <>
      <main className="min-h-screen bg-[#f8f7f3]">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="relative isolate z-[9999] mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-[#e7b10a] bg-[#f4b400] px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(244,180,0,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#e0a800] focus:outline-none focus:ring-2 focus:ring-[#f4b400]/50"
              style={{ pointerEvents: 'auto' }}
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>

            {isOwner && (
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/need-help/${helpRequest._id}/edit`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#f1d58a] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#fff8e6]"
                >
                  <Pencil size={16} />
                  Chỉnh sửa yêu cầu
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
            )}
          </div>

          <div className="space-y-6">
            {isAdmin ? <AdminAssignmentPanel helpRequest={helpRequest} /> : null}

            <section className="overflow-hidden rounded-[32px] border border-[#ece7dc] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
              <div className="p-5 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <InfoBadge>{category}</InfoBadge>
                  <InfoBadge tone="blue">{urgency}</InfoBadge>
                  <MetaChip icon={MapPin}>{locationText}</MetaChip>
                  <MetaChip icon={CalendarDays}>{submittedAt}</MetaChip>
                </div>

                <div className="mt-6 border-b border-slate-200 pb-6">
                  <h1 className="max-w-3xl break-all text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-[#0f172a]">
                    {title}
                  </h1>

                  <p className="mt-5 max-w-2xl break-all whitespace-pre-wrap text-[18px] leading-8 text-slate-600">
                    {description}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.24em] text-[#8b7b5e]">
                    Câu chuyện
                  </div>

                  <div className="rounded-[28px] border border-[#ebe5d8] bg-[#fcfbf8] p-6">
                    <p className="max-w-none whitespace-pre-wrap break-all text-[15px] leading-8 text-slate-700">
                      {helpRequest.story || 'Chưa có câu chuyện nào được cung cấp.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
                  {imageUrl ? (
                    <div className="rounded-[28px] border border-[#ebe5d8] bg-[#fcfbf8] p-5 sm:p-6">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#8b7b5e]">
                          Image
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsImagePreviewOpen(true)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#e7dfcf] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Expand className="h-3.5 w-3.5" />
                          Xem
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

                  <div className="flex flex-col gap-4">
                    <div className="rounded-[28px] border border-[#ebe5d8] bg-[#fcfbf8] p-6">
                      <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.24em] text-[#8b7b5e]">
                        Được gửi bởi
                      </div>

                      <div className="min-w-0">
                        <div className="break-all text-xl font-semibold text-slate-900">
                          {requesterName}
                        </div>
                        <div className="mt-1 break-all text-sm text-slate-500">
                          {requesterEmail}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[#ebe5d8] bg-[#fcfbf8] p-6">
                      <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.24em] text-[#8b7b5e]">
                        Liên hệ
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
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <HelpRequestFundingCard amountNeeded={helpRequest.amountNeeded} />
                </div>

                <div className="mt-6">
                  <HelpRequestVerification helpRequest={helpRequest} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        imageUrl={imageUrl}
        title={title}
        onClose={() => setIsImagePreviewOpen(false)}
      />
    </>
  );
}

export default HelpRequestDetailPage;