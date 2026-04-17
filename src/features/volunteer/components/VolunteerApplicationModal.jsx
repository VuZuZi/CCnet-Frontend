import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Sparkles, X } from 'lucide-react';
import { VolunteerApplicationForm } from './VolunteerApplicationForm';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export const VolunteerApplicationModal = ({
  isOpen,
  onClose,
  project,
  projectId,
  projectName,
  onSuccess,
}) => {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose?.();
  };

  const displayName = user?.fullName || user?.name || 'Người dùng';
  const displayEmail = user?.email || '';
  const displayInitial =
    user?.fullName?.charAt(0)?.toUpperCase() ||
    user?.name?.charAt(0)?.toUpperCase() ||
    'U';

  const modalContent = (
    <div
      className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[4px] sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[#F2E6C9] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="h-1.5 w-full shrink-0 bg-[linear-gradient(90deg,#FACC15_0%,#F59E0B_55%,#FDE68A_100%)]" />

        <div className="shrink-0 border-b border-[#F3E7CC] bg-[linear-gradient(180deg,#FFFDF6_0%,#FFFFFF_100%)] px-6 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#F4DE9A] bg-[#FFF7D6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#A16207]">
                <Sparkles size={12} />
                Volunteer Application
              </div>

              <p className="truncate text-sm font-medium text-slate-500">
                {projectName || project?.title || 'Dự án'}
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#0F2747]">
                Tham gia dự án với vai trò tình nguyện viên
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Hoàn thiện thông tin đăng ký để organizer xem xét hồ sơ của bạn.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Đóng modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-7">
          <div className="mb-6 rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#fffdf8_0%,#ffffff_42%,#f8fbff_100%)] p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="relative h-14 w-14 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-amber-100 blur-md opacity-70" />
                  <div className="relative h-14 w-14 overflow-hidden rounded-full ring-4 ring-white shadow-sm">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-amber-200 text-lg font-black text-amber-700">
                        {displayInitial}
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Hồ sơ ứng viên
                  </p>
                  <h3 className="mt-1 truncate text-xl font-black text-slate-900">
                    {displayName}
                  </h3>
                  <p className="truncate text-sm text-slate-500">
                    {displayEmail}
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-amber-800 shadow-sm">
                <ShieldCheck size={18} />
                Trust Score: {user?.trustScore || 850}
              </div>
            </div>
          </div>

          <VolunteerApplicationForm
            project={project}
            projectId={projectId}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default VolunteerApplicationModal;