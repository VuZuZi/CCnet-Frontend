import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

const ACTION_COPY = {
  REQUEST_PROJECT_UPDATE: {
    title: "Yêu cầu cập nhật dự án",
    description:
      "Nêu rõ nội dung quản trị viên muốn tổ chức cập nhật. Nội dung này sẽ được gửi trực tiếp cho tổ chức dưới dạng thông báo từ quản trị viên.",
    placeholder:
      "Ví dụ: Vui lòng cập nhật lại mốc hoạt động và phân bổ ngân sách để khớp với số tiền hiện tại của dự án...",
    confirmText: "Gửi yêu cầu cập nhật",
  },
  SUBMIT_PROJECT_FOR_REVIEW: {
    title: "Gửi dự án để kiểm duyệt",
    description:
      "Vui lòng nhập lý do rõ ràng để ghi lại lý do dự án này được chuyển vào hàng đợi kiểm duyệt.",
    placeholder:
      "Ví dụ: Các tài liệu đã được xem xét và dự án đã sẵn sàng để kiểm duyệt chính thức.",
    confirmText: "Xác nhận gửi",
  },
  REQUEST_PROJECT_REVISION: {
    title: "Yêu cầu sửa đổi",
    description:
      "Lý do này sẽ giúp các quản trị viên khác theo dõi vấn đề và giúp người tổ chức hiểu những gì cần phải khắc phục.",
    placeholder:
      "Ví dụ: Thiếu tài liệu xác minh, phân bổ ngân sách không rõ ràng...",
    confirmText: "Xác nhận yêu cầu sửa đổi",
  },
  REJECT_PROJECT: {
    title: "Từ chối dự án",
    description:
      "Bắt buộc phải có lý do để lưu giữ lịch sử quản trị và hỗ trợ đánh giá nội bộ.",
    placeholder:
      "Ví dụ: Không đủ độ tin cậy, thông tin dự án không nhất quán...",
    confirmText: "Xác nhận từ chối",
  },
  PAUSE_PROJECT: {
    title: "Tạm dừng dự án",
    description:
      "Nhập lý do rõ ràng để các quản trị viên khác hiểu tại sao dự án này bị tạm dừng.",
    placeholder:
      "Ví dụ: Cần xác minh dòng tiền / phát hiện rủi ro tiềm ẩn...",
    confirmText: "Xác nhận tạm dừng",
  },
  RESUME_PROJECT: {
    title: "Tiếp tục dự án",
    description:
      "Nhập lý do để ghi lại lý do dự án này được phép tiếp tục.",
    placeholder:
      "Ví dụ: Đã hoàn tất xác minh và dự án đủ điều kiện để tiếp tục.",
    confirmText: "Xác nhận tiếp tục",
  },
  COMPLETE_PROJECT: {
    title: "Hoàn thành dự án",
    description:
      "Nhập ghi chú hoặc lý do để giải thích tại sao dự án bị đóng bởi quản trị viên.",
    placeholder:
      "Ví dụ: Các mục tiêu của dự án đã đạt được và việc đóng dự án đã được xác nhận.",
    confirmText: "Xác nhận hoàn thành",
  },
  CANCEL_PROJECT: {
    title: "Hủy dự án",
    description:
      "Nhập lý do chi tiết để bảo lưu nhật ký quản trị và hỗ trợ các cuộc kiểm toán trong tương lai.",
    placeholder:
      "Ví dụ: Vi phạm chính sách nền tảng / tìm thấy bằng chứng gian lận...",
    confirmText: "Xác nhận hủy",
  },
  DELETE_PROJECT: {
    title: "Xóa dự án",
    description:
      "Đây là một hành động nhạy cảm. Cần có lý do rõ ràng để quản lý nội bộ.",
    placeholder:
      "Ví dụ: Xóa bản ghi bị lỗi / xóa dựa trên quyết định của quản trị viên...",
    confirmText: "Xác nhận xóa",
  },
  UPDATE_PROJECT_STATUS: {
    title: "Cập nhật trạng thái",
    description: "Vui lòng nhập lý do để bảo lưu lịch sử quản trị.",
    placeholder: "Nhập lý do...",
    confirmText: "Xác nhận cập nhật",
  },
};

export default function ProjectActionReasonModal({
  open,
  project,
  actionKey,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose?.();
    };

    const originalOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, loading]);

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open, actionKey, project?._id]);

  const content = useMemo(() => {
    return (
      ACTION_COPY[actionKey] || {
        title: "Xác nhận hành động",
        description: "Vui lòng nhập lý do để tiếp tục.",
        placeholder: "Nhập lý do...",
        confirmText: "Xác nhận",
      }
    );
  }, [actionKey]);

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Đóng hộp thoại lý do"
        onClick={() => {
          if (!loading) onClose?.();
        }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      <div
        className="relative z-10 w-full max-w-xl rounded-[32px] border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <AlertTriangle size={20} />
              </div>

              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  {content.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {project?.title || "Dự án"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!loading) onClose?.();
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 md:px-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold leading-6 text-amber-800">
              {content.description}
            </p>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-black text-slate-800">
              Lý do <span className="text-rose-500">*</span>
            </label>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={content.placeholder}
              rows={6}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 px-5 py-4 md:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                if (!loading) onClose?.();
              }}
              disabled={loading}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={loading || !String(reason || "").trim()}
              onClick={() => onConfirm?.(String(reason || "").trim())}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {content.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
