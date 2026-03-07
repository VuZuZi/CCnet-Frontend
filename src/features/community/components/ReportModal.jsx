import { useState } from "react";
import { usePostMutations } from "../hooks/usePostMutations";
import { Button } from "@/shared/components/ui/Button/Button";

export default function ReportModal({ isOpen, onClose, postId }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [message, setMessage] = useState(null);

  const { reportPost } = usePostMutations();

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    setEvidenceFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postId) return;

    setMessage(null);
    const formData = new FormData();
    formData.append("reason_code", reason.trim());
    formData.append("description", description.trim());
    
    evidenceFiles.forEach((file) => {
      formData.append("evidence_files", file); 
    });

    try {
      await reportPost.mutateAsync({ postId, formData });
      setMessage({ type: "success", text: "Report submitted successfully!" });
      setTimeout(() => {
        onClose();
        setReason("");
        setDescription("");
        setEvidenceFiles([]);
        setMessage(null);
      }, 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit report.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-light-gray flex justify-between items-center bg-white">
          <h5 className="font-bold text-xl m-0">Report Post</h5>
          <button className="text-2xl cursor-pointer" onClick={onClose}>&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {message && (
            <div className={`p-4 rounded-lg mb-5 ${message.type === "success" ? "bg-[#d1e7dd] text-[#0f5132]" : "bg-[#f8d7da] text-[#842029]"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-bold mb-2">Reason *</label>
              <select
                className="w-full rounded-md border border-light-gray py-2.5 px-3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={reportPost.isPending}
              >
                <option value="">Choose a reason</option>
                <option value="spam">Spam / Advertising</option>
                <option value="harassment">Harassment / Bullying</option>
                <option value="inappropriate">Inappropriate / NSFW</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">Additional details</label>
              <textarea
                className="w-full rounded-md border border-light-gray py-2.5 px-3"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={reportPost.isPending}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Evidence (max 5 images)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:bg-light-gray cursor-pointer"
                onChange={handleFiles}
                disabled={reportPost.isPending}
              />
              {evidenceFiles.length > 0 && (
                 <p className="text-sm text-gray mt-2">{evidenceFiles.length} file(s) selected.</p>
              )}
            </div>

            <Button type="submit" variant="danger" className="w-full !py-3" disabled={reportPost.isPending || !reason.trim()} isLoading={reportPost.isPending}>
              Submit Report
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}