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
    .min(5, "Please enter a reason of at least 5 characters")
    .max(1000, "Reason cannot exceed 1000 characters"),
});

const NON_PENDING_STATES = {
  AWAITING_MICRO_DEPOSIT: {
    title: "Awaiting transaction verification",
    desc: "User is currently in the process of bank transaction reconciliation (Micro-deposit). Cannot approve at this time.",
    icon: <Clock size={20} className="text-sky-600" />,
    wrapperClass: "border-sky-200 bg-sky-50",
    titleClass: "text-sky-900",
    descClass: "text-sky-700",
  },
  SYSTEM_CHECKING: {
    title: "System is running automatic checks",
    desc: "The system is running automated checks (AML, Fraud, Cross-link Bank). Please wait until completed.",
    icon: <Info size={20} className="text-indigo-600" />,
    wrapperClass: "border-indigo-200 bg-indigo-50",
    titleClass: "text-indigo-900",
    descClass: "text-indigo-700",
  },
  DECLINED: {
    title: "Request declined",
    desc: "The user has received a notification to edit and resubmit their documents.",
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
    defaultValues: {
      reviewReason: "",
    },
  });

  if (!isOpen) return null;

  const isApprove = type === "approve";

  const submit = async (data) => {
    try {
      await onConfirm(data.reviewReason);
      onClose();
      reset();
    } catch {
      // giữ modal mở nếu request fail
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-in zoom-in-95 rounded-3xl bg-white p-6 shadow-xl fade-in duration-200 sm:p-8">
        <button
          disabled={isProcessing}
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 transition hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <div className="mb-5 flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isApprove
                ? "bg-emerald-100 text-emerald-600"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {isApprove ? <CheckCircle size={24} /> : <XCircle size={24} />}
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {isApprove ? "Approve Organizer" : "Decline request"}
          </h3>
        </div>

        <form onSubmit={handleSubmit(submit)}>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {isApprove ? "Reason for approval" : "Reason for decline"}
          </label>

          <textarea
            {...register("reviewReason")}
            disabled={isProcessing}
            rows={4}
            autoFocus
            placeholder={
              isApprove
                ? "Enter a clear reason for approving this organizer request..."
                : "Enter a clear reason so the Organizer knows how to provide the correct documents..."
            }
            className={`w-full rounded-2xl border p-4 text-sm outline-none transition focus:ring-2 disabled:bg-slate-50 disabled:opacity-70 ${
              errors.reviewReason
                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
            }`}
          />

          {errors.reviewReason && (
            <p className="mt-2 text-xs font-medium text-rose-500">
              {errors.reviewReason.message}
            </p>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition ${
                isApprove
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-rose-500 hover:bg-rose-600"
              }`}
            >
              {isProcessing
                ? "Processing..."
                : isApprove
                ? "Confirm approval"
                : "Confirm decline"}
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

  if (status === "APPROVED") {
    return null;
  }

  if (status !== "PENDING") {
    const stateConfig =
      NON_PENDING_STATES[status] || NON_PENDING_STATES.DECLINED;

    return (
      <div
        className={`flex items-start gap-4 rounded-2xl border p-6 shadow-sm ${stateConfig.wrapperClass}`}
      >
        <div className="mt-0.5 shrink-0 rounded-full bg-white p-2 shadow-sm">
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
      <h3 className="text-lg font-bold text-slate-900">Approval Decision</h3>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Ensure you have thoroughly checked the identification documents and
        organization information before making a decision.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDeclineModalOpen(true)}
          className="flex-1 rounded-xl bg-slate-100 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
        >
          Decline
        </button>

        <button
          type="button"
          onClick={() => setApproveModalOpen(true)}
          className="flex-1 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600"
        >
          Approve
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