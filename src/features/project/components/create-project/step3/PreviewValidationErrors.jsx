import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function PreviewValidationErrors({ items = [] }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 text-emerald-600" size={20} />
          <div>
            <h4 className="text-sm font-bold text-emerald-800">
              Dự án đã sẵn sàng để gửi duyệt
            </h4>
            <p className="mt-1 text-sm text-emerald-700">
              Tất cả thông tin bắt buộc đã đầy đủ. Bạn có thể gửi dự án cho ban quản trị kiểm duyệt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 text-red-600" size={20} />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-800">
            Cần hoàn thiện thêm trước khi gửi duyệt
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {items.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PreviewValidationErrors;