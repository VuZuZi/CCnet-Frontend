import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

const ACTION_COPY = {
  SUBMIT_PROJECT_FOR_REVIEW: {
    title: "Submit project for review",
    description:
      "Please enter a clear reason to record why this project is being moved into the review queue.",
    placeholder:
      "Example: Documents were reviewed and the project is ready for formal moderation.",
    confirmText: "Confirm submission",
  },
  REQUEST_PROJECT_REVISION: {
    title: "Request revision",
    description:
      "This reason will help other admins track the issue and help the organizer understand what must be fixed.",
    placeholder:
      "Example: Missing verification documents, unclear budget breakdown...",
    confirmText: "Confirm revision request",
  },
  REJECT_PROJECT: {
    title: "Reject project",
    description:
      "A reason is required to preserve the administrative history and support internal review.",
    placeholder:
      "Example: Insufficient credibility, inconsistent project information...",
    confirmText: "Confirm rejection",
  },
  PAUSE_PROJECT: {
    title: "Pause project",
    description:
      "Enter a clear reason so other admins understand why this project was paused.",
    placeholder:
      "Example: Need to verify financial flow / potential risk detected...",
    confirmText: "Confirm pause",
  },
  RESUME_PROJECT: {
    title: "Resume project",
    description:
      "Enter a reason to record why this project is allowed to continue.",
    placeholder:
      "Example: Verification completed and project is eligible to continue.",
    confirmText: "Confirm resume",
  },
  COMPLETE_PROJECT: {
    title: "Complete project",
    description:
      "Enter a note or reason to explain why the project is being closed by admin.",
    placeholder:
      "Example: Project goals were achieved and closure was confirmed.",
    confirmText: "Confirm completion",
  },
  CANCEL_PROJECT: {
    title: "Cancel project",
    description:
      "Enter a detailed reason to preserve the admin log and support future audits.",
    placeholder:
      "Example: Platform policy violation / evidence of fraud found...",
    confirmText: "Confirm cancellation",
  },
  DELETE_PROJECT: {
    title: "Delete project",
    description:
      "This is a sensitive action. A clear reason is required for internal management.",
    placeholder:
      "Example: Delete corrupted record / remove based on admin decision...",
    confirmText: "Confirm deletion",
  },
  UPDATE_PROJECT_STATUS: {
    title: "Update status",
    description: "Please enter a reason to preserve the admin history.",
    placeholder: "Enter reason...",
    confirmText: "Confirm update",
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
        title: "Confirm action",
        description: "Please enter a reason to continue.",
        placeholder: "Enter reason...",
        confirmText: "Confirm",
      }
    );
  }, [actionKey]);

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close reason modal"
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
                  {project?.title || "Project"}
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
              Reason <span className="text-rose-500">*</span>
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
              Cancel
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