// src/components/ReportModal.jsx
import { useState } from "react";

const ReportModal = ({ isOpen, onClose, reportId, onSubmit }) => {
  const [selectedActions, setSelectedActions] = useState([]);
  const [resolutionNote, setResolutionNote] = useState("");

  if (!isOpen) return null;

  const handleCheckboxChange = (actionValue) => {
    setSelectedActions((prev) =>
      prev.includes(actionValue)
        ? prev.filter((a) => a !== actionValue)
        : [...prev, actionValue],
    );
  };

  const handleConfirm = () => {
    // If no specific action selected, default to mark_resolved
    const actionsToSend =
      selectedActions.length > 0 ? selectedActions : ["mark_resolved"];
    onSubmit(reportId, actionsToSend, resolutionNote || "No note provided");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">
            Resolve Report
          </h4>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-500 font-medium">
          Select administrative actions:
        </p>

        <div className="space-y-3 mb-8">
          {/* Action: Delete Content */}
          <label
            className={`flex cursor-pointer items-start rounded-xl border p-4 transition-all ${
              selectedActions.includes("delete_content")
                ? "border-red-500 bg-red-50/30"
                : "border-slate-100 bg-slate-50/50"
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              checked={selectedActions.includes("delete_content")}
              onChange={() => handleCheckboxChange("delete_content")}
            />
            <div className="ml-4">
              <span className="font-bold text-red-600 block text-sm">
                Delete Content
              </span>
              <span className="text-xs text-slate-500">
                Remove post permanently from the platform.
              </span>
            </div>
          </label>

          {/* Action: Ban User */}
          <label
            className={`flex cursor-pointer items-start rounded-xl border p-4 transition-all ${
              selectedActions.includes("ban_user")
                ? "border-primary bg-primary/5"
                : "border-slate-100 bg-slate-50/50"
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              checked={selectedActions.includes("ban_user")}
              onChange={() => handleCheckboxChange("ban_user")}
            />
            <div className="ml-4">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Ban User
              </span>
              <span className="text-xs text-slate-500">
                Suspend the author's account immediately.
              </span>
            </div>
          </label>
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
            Decision Note
          </label>
          <textarea
            rows="3"
            placeholder="Why was this action taken?"
            className="w-full rounded-xl border-slate-200 bg-slate-50 p-4 text-sm focus:border-primary focus:ring-0"
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            Confirm Action
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
