import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CheckCircle, XCircle, Info, Clock, CheckCircle2, Ban } from 'lucide-react';
import { useToast } from '@/shared/contexts/ToastContext';


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
  APPROVED: {
    title: "Request approved",
    desc: "This user has been granted Organizer role (KYC Tier 1).",
    icon: <CheckCircle2 size={20} className="text-emerald-600" />,
    wrapperClass: "border-emerald-200 bg-emerald-50",
    titleClass: "text-emerald-900",
    descClass: "text-emerald-700",
  },
  DECLINED: {
    title: "Request declined",
    desc: "The user has received a notification to edit and resubmit their documents.",
    icon: <Ban size={20} className="text-slate-500" />,
    wrapperClass: "border-slate-200 bg-slate-50",
    titleClass: "text-slate-800",
    descClass: "text-slate-600",
  }
};


function useModalScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);
}

function ApproveModal({ isOpen, onClose, onConfirm, isProcessing }) {
  useModalScrollLock(isOpen);
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch {
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button disabled={isProcessing} onClick={onClose} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition">
          <X size={20} />
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Approve Organizer</h3>
        </div>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          Are you sure you want to grant Organizer rights to this organization? This action grants KYC Tier 1 to the user and unlocks the fundraising project creation feature.
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" disabled={isProcessing} onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} disabled={isProcessing} className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition flex items-center gap-2">
            {isProcessing ? 'Processing...' : 'Confirm approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

const declineSchema = z.object({
  reason: z.string().min(5, "Please enter a reason of at least 5 characters").max(1000, "Reason cannot exceed 1000 characters"),
});

function DeclineModal({ isOpen, onClose, onConfirm, isProcessing }) {
  useModalScrollLock(isOpen);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(declineSchema),
  });

  if (!isOpen) return null;

  const submit = async (data) => {
    try {
      await onConfirm(data.reason);
      onClose();
      reset();
    } catch {
      // Catch to prevent Modal from closing on network error 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button disabled={isProcessing} onClick={onClose} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition">
          <X size={20} />
        </button>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Decline request</h3>
        </div>
        <form onSubmit={handleSubmit(submit)}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for decline</label>
          <textarea
            {...register('reason')}
            disabled={isProcessing}
            className={`w-full rounded-2xl border p-4 text-sm outline-none transition focus:ring-2 disabled:bg-slate-50 disabled:opacity-70 ${errors.reason ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'
              }`}
            rows={4}
            placeholder="Enter a clear reason so the Organizer knows how to provide the correct documents..."
            autoFocus
          />
          {errors.reason && <p className="mt-2 text-xs font-medium text-rose-500">{errors.reason.message}</p>}

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" disabled={isProcessing} onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing} className="px-6 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition flex items-center gap-2">
              {isProcessing ? 'Processing...' : 'Confirm decline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export function OrganizerReviewActions({ status, onApprove, onDecline, isApproving, isDeclining }) {
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);

  if (status !== 'PENDING') {
    const stateConfig = NON_PENDING_STATES[status] || NON_PENDING_STATES.DECLINED;

    return (
      <div className={`flex items-start gap-4 rounded-2xl border p-6 shadow-sm ${stateConfig.wrapperClass}`}>
        <div className="mt-0.5 shrink-0 bg-white p-2 rounded-full shadow-sm">
          {stateConfig.icon}
        </div>
        <div>
          <h3 className={`text-lg font-bold ${stateConfig.titleClass}`}>{stateConfig.title}</h3>
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
      <p className="mt-1 text-sm text-slate-500 mb-6">
        Ensure you have thoroughly checked the identification documents and organization information before making a decision.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDeclineModalOpen(true)}
          className="flex-1 rounded-xl bg-slate-100 px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => setApproveModalOpen(true)}
          className="flex-1 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-600 transition"
        >
          Approve
        </button>
      </div>

      <ApproveModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={onApprove}
        isProcessing={isApproving}
      />
      <DeclineModal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        onConfirm={onDecline}
        isProcessing={isDeclining}
      />
    </div>
  );
}

export default OrganizerReviewActions;