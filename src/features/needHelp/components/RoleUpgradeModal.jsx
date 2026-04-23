import { AlertCircle, CheckCircle2 } from 'lucide-react';

const DEFAULT_BENEFITS = [
  'Tạo và quản lý các dự án cộng đồng',
  'Gây quỹ cho những hoạt động bạn quan tâm',
  'Tuyển tình nguyện viên cho sáng kiến của bạn',
  'Truy cập không gian làm việc và số liệu dành cho nhà tổ chức',
];

export function RoleUpgradeModal({
  isOpen,
  onAssignNow,
  onLater,
  title = 'Trở thành nhà tổ chức',
  description = 'Bạn cần quyền nhà tổ chức để đứng ra tổ chức chiến dịch từ yêu cầu này.',
  confirmLabel = 'Đăng ký ngay',
  benefitsTitle = 'Khi trở thành nhà tổ chức, bạn có thể:',
  benefits = DEFAULT_BENEFITS,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md animate-in rounded-[28px] border border-slate-200 bg-white shadow-lg">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-center text-2xl font-bold text-slate-900">
              {title}
            </h2>
            <p className="text-center text-sm text-slate-600">
              {description}
            </p>
          </div>

          <div className="space-y-2 rounded-xl bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
              {benefitsTitle}
            </p>
            <ul className="space-y-2 text-sm text-amber-900">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 flex-shrink-0 text-amber-600"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onLater}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Để sau
            </button>
            <button
              type="button"
              onClick={onAssignNow}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-amber-500"
            >
              <CheckCircle2 size={16} />
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleUpgradeModal;
