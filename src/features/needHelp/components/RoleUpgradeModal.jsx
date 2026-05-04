import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function RoleUpgradeModal({ isOpen, onAssignNow, onLater }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md animate-in rounded-[28px] border border-slate-200 bg-white shadow-lg">
        <div className="space-y-6 p-6 sm:p-8">
          {/* Icon and Header */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-center text-2xl font-bold text-slate-900">
              Trở thành tổ chức
            </h2>
            <p className="text-center text-sm text-slate-600">
              Bạn chưa phải là tổ chức. Bạn có muốn đăng ký làm tổ chức ngay bây giờ không?
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2 rounded-xl bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
              Khi trở thành tổ chức, bạn có thể:
            </p>
            <ul className="space-y-2 text-sm text-amber-900">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <span>Tạo và quản lý các dự án cộng đồng</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <span>Gây quỹ cho những hoạt động bạn quan tâm</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <span>Tuyển tình nguyện viên cho sáng kiến của bạn</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <span>Truy cập không gian làm việc và số liệu dành cho tổ chức</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
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
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-amber-500"
            >
              <CheckCircle2 size={16} />
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
