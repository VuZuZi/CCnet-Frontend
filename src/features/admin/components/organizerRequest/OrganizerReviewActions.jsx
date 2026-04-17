import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  CheckCircle2,
  Ban,
} from "lucide-react";

const reasonSchema = z.object({
  reviewReason: z
    .string()
    .min(5, "Vui lòng nhập lý do có ít nhất 5 ký tự")
    .max(1000, "Lý do không được vượt quá 1000 ký tự"),
});

const NON_PENDING_STATES = {
  AWAITING_MICRO_DEPOSIT: {
    title: "Đang chờ xác minh giao dịch",
    desc: "Người dùng hiện đang trong quá trình đối soát giao dịch ngân hàng (Micro-deposit). Chưa thể phê duyệt lúc này.",
    icon: <Clock size={20} className="text-sky-600" />,
    wrapperClass: "border-sky-200 bg-sky-50",
    titleClass: "text-sky-900",
    descClass: "text-sky-700",
  },
  SYSTEM_CHECKING: {
    title: "Hệ thống đang chạy kiểm tra tự động",
    desc: "Hệ thống đang chạy kiểm tra tự động (AML, Gian lận, Liên kết ngân hàng). Vui lòng đợi đến khi hoàn tất.",
    icon: <Info size={20} className="text-indigo-600" />,
    wrapperClass: "border-indigo-200 bg-indigo-50",
    titleClass: "text-indigo-900",
    descClass: "text-indigo-700",
  },
  DECLINED: {
    title: "Yêu cầu đã bị từ chối",
    desc: "Người dùng đã nhận được thông báo để chỉnh sửa và nộp lại tài liệu của họ.",
    icon: <Ban size={20} className="text-slate-500" />,
    wrapperClass: "border-slate-200 bg-slate-50",
    titleClass: "text-slate-800",
    descClass: "text-slate-600",
  },
};

function useModalScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);
}

function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  type = "approve",
}) {
  useModalScrollLock(isOpen);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(reasonSchema),
    defaultValues: { reviewReason: "" },
  });

  if (!isOpen) return null;

  const isApprove = type === "approve";

  const submit = async (data) => {
    try {
      await onConfirm(data.reviewReason);
      onClose();
      reset();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <button
          disabled={isProcessing}
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <div className="mb-5 flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isApprove
                ? "bg-emerald-100 text-emerald-600"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {isApprove ? <CheckCircle size={24} /> : <XCircle size={24} />}
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            {isApprove ? "Phê duyệt Tổ chức" : "Từ chối yêu cầu"}
          </h3>
        </div>

        <form onSubmit={handleSubmit(submit)}>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {isApprove ? "Lý do phê duyệt" : "Lý do từ chối"}
          </label>

          <textarea
            {...register("reviewReason")}
            disabled={isProcessing}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />

          {errors.reviewReason && (
            <p className="mt-2 text-xs text-rose-500">
              {errors.reviewReason.message}
            </p>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white ${
                isApprove
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-rose-500 hover:bg-rose-600"
              }`}
            >
              {isProcessing
                ? "Đang xử lý..."
                : isApprove
                ? "Xác nhận phê duyệt"
                : "Xác nhận từ chối"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function OrganizerReviewActions({
  status,
  onApprove,
  onDecline,
  isApproving,
  isDeclining,
}) {
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);

  if (status === "APPROVED") return null;

  if (status !== "PENDING") {
    const stateConfig =
      NON_PENDING_STATES[status] || NON_PENDING_STATES.DECLINED;

    return (
      <div
        className={`flex items-start gap-4 rounded-2xl border p-6 shadow-sm ${stateConfig.wrapperClass}`}
      >
        <div className="rounded-full bg-white p-2 shadow-sm">
          {stateConfig.icon}
        </div>
        <div>
          <h3 className={`text-lg font-bold ${stateConfig.titleClass}`}>
            {stateConfig.title}
          </h3>
          <p className={`mt-1 text-sm ${stateConfig.descClass}`}>
            {stateConfig.desc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">
        Quyết định phê duyệt
      </h3>

      <p className="mb-6 mt-1 text-sm text-slate-500">
        Đảm bảo bạn đã kiểm tra kỹ các giấy tờ tùy thân và thông tin tổ chức trước khi đưa ra quyết định.
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setDeclineModalOpen(true)}
          className="rounded-xl bg-rose-100 px-6 py-3 font-bold text-rose-700 hover:bg-rose-200"
        >
          Từ chối
        </button>

        <button
          onClick={() => setApproveModalOpen(true)}
          className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-white hover:bg-amber-600"
        >
          Phê duyệt
        </button>
      </div>

      <ActionModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={(reviewReason) => onApprove({ reviewReason })}
        isProcessing={isApproving}
        type="approve"
      />

      <ActionModal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        onConfirm={(reviewReason) => onDecline({ reviewReason })}
        isProcessing={isDeclining}
        type="decline"
      />
    </div>
  );
}

export default OrganizerReviewActions;