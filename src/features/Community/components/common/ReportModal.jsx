import { useState } from "react";
import { usePostMutations } from "../../hooks/usePostMutations";
import { Button } from "@/shared/components/ui/Button/Button";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";

const REPORT_REASONS = [
  { value: "spam", label: "Thư rác / quảng cáo" },
  { value: "harassment", label: "Quấy rối / Bắt nạt" },
  { value: "inappropriate", label: "Nội dung không phù hợp / Phản cảm" },
];

export default function ReportModal({ isOpen, onClose, postId }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [message, setMessage] = useState(null);

  const { reportPost } = usePostMutations();
  useBodyScrollLock(isOpen);

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    setEvidenceFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
  };

  const resetForm = () => {
    onClose();
    setReason("");
    setDescription("");
    setEvidenceFiles([]);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postId || !reason.trim() || reportPost.isPending) return;

    setMessage(null);

    const payload = {
      reason_code: reason.trim(),
      description: description.trim(),
      report_ref: `REPORT_${postId}_${Date.now()}`,
      target_type: "post",
      target_ref: postId,
    };

    try {
      await reportPost.mutateAsync({ postId, payload });
      setMessage({ type: "success", text: "Gửi báo cáo thành công!" });
      setTimeout(resetForm, 2000);
    } catch (err) {
      const status = err.response?.status || err.status;

      if (status === 400 || status === 409) {
        setMessage({
          type: "error",
          text: "Bạn đã gửi báo cáo cho bài viết này trước đó rồi!",
        });
      } else {
        setMessage({
          type: "error",
          text: err.response?.data?.message || "Gửi báo cáo thất bại.",
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ccnet-modal-overlay fixed inset-0 z-[1050] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="ccnet-modal-panel flex max-h-[90vh] w-full max-w-lg flex-col rounded-[24px] bg-white shadow-xl">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-[24px]">
          <h5 className="font-bold text-xl m-0">Báo cáo bài viết</h5>
          <button
            className="text-2xl cursor-pointer"
            onClick={onClose}
            disabled={reportPost.isPending}
          >
            &times;
          </button>
        </div>

        <div className="ccnet-modal-scroll overflow-y-auto p-6">
          {message && (
            <div
              className={`p-4 rounded-xl mb-5 ${
                message.type === "success"
                  ? "bg-[#d1e7dd] text-[#0f5132]"
                  : "bg-[#f8d7da] text-[#842029]"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-bold mb-2">Lý do *</label>
              <select
                className="w-full rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setMessage(null);
                }}
                required
                disabled={reportPost.isPending}
              >
                <option value="">Chọn một lý do</option>
                {REPORT_REASONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={reportPost.isPending}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Bằng chứng (tối đa 5 ảnh)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="block w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:font-medium hover:file:bg-slate-200 cursor-pointer"
                onChange={handleFiles}
                disabled={reportPost.isPending}
              />
              {evidenceFiles.length > 0 && (
                <p className="text-sm text-gray mt-2">
                  Đã chọn {evidenceFiles.length} tệp.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full !py-3.5 !rounded-xl !bg-[#fbbf24] hover:!bg-[#f59e0b] !text-white !font-bold !border-none"
              disabled={reportPost.isPending || !reason.trim()}
              isLoading={reportPost.isPending}
            >
              Gửi báo cáo
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
