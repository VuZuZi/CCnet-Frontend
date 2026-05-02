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

const approveSchema = reasonSchema.extend({
  checklist: z.object({
    manualIdentityReviewAcknowledged: z.literal(true, {
      errorMap: () => ({ message: "Bắt buộc xác nhận" }),
    }),
    commitmentReviewed: z.literal(true, {
      errorMap: () => ({ message: "Bắt buộc xác nhận" }),
    }),
    organizationInfoReviewed: z.literal(true, {
      errorMap: () => ({ message: "Bắt buộc xác nhận" }),
    }),
    bankInfoReviewed: z.literal(true, {
      errorMap: () => ({ message: "Bắt buộc xác nhận" }),
    }),
    riskFlagsReviewed: z.literal(true, {
      errorMap: () => ({ message: "Bắt buộc xác nhận" }),
    }),
  }),
});

const CHECKLIST_ITEMS = [
  { id: "manualIdentityReviewAcknowledged", label: "Tôi đã xem xét trạng thái danh tính/xét duyệt thủ công của người đăng ký." },
  { id: "commitmentReviewed", label: "Tôi đã kiểm tra bản cam kết trách nhiệm và thông tin người ký." },
  { id: "organizationInfoReviewed", label: "Tôi đã xem xét thông tin tổ chức/nhóm và các minh chứng liên quan nếu có." },
  { id: "bankInfoReviewed", label: "Tôi đã xem xét thông tin tài khoản ngân hàng và các cảnh báo liên quan nếu có." },
  { id: "riskFlagsReviewed", label: "Tôi đã xem xét các cảnh báo rủi ro của hệ thống trước khi ra quyết định." }
];

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

  const isApprove = type === "approve";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(isApprove ? approveSchema : reasonSchema),
    defaultValues: {
      reviewReason: "",
      checklist: isApprove ? {
        manualIdentityReviewAcknowledged: false,
        commitmentReviewed: false,
        organizationInfoReviewed: false,
        bankInfoReviewed: false,
        riskFlagsReviewed: false
      } : undefined
    },
    mode: "onChange"
  });

  if (!isOpen) return null;

  const submit = async (data) => {
    try {
      if (isApprove) {
        await onConfirm({ reviewReason: data.reviewReason, checklist: data.checklist });
      } else {
        await onConfirm({ reviewReason: data.reviewReason });
      }
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
            rows={isApprove ? 2 : 4}
            className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />

          {errors.reviewReason && (
            <p className="mt-2 text-xs text-rose-500">
              {errors.reviewReason.message}
            </p>
          )}

          {isApprove && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Danh mục kiểm tra bắt buộc
              </label>
              <div className="space-y-3">
                {CHECKLIST_ITEMS.map((item) => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        {...register(`checklist.${item.id}`)}
                        disabled={isProcessing}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700">
                        {item.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.checklist && (
                <p className="mt-2 text-xs text-rose-500">
                  Vui lòng xác nhận tất cả các mục kiểm tra.
                </p>
              )}
            </div>
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
              disabled={isProcessing || (isApprove && !isValid)}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed ${
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
        Trước khi phê duyệt, hãy xem xét thông tin tổ chức, minh chứng hoạt động, thông tin ngân hàng, cam kết trách nhiệm và các cảnh báo rủi ro liên quan.
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
        onConfirm={(payload) => onApprove(payload)}
        isProcessing={isApproving}
        type="approve"
      />

      <ActionModal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        onConfirm={(payload) => onDecline(payload)}
        isProcessing={isDeclining}
        type="decline"
      />
    </div>
  );
}

export default OrganizerReviewActions;