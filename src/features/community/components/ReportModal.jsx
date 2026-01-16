import { useState } from "react";
import { postAPI } from "../api/postAPI";

export default function ReportModal({ isOpen, onClose, postId }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [cloudinaryUrls, setCloudinaryUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const CLOUD_NAME = "dehphwer7";
  const UPLOAD_PRESET = "ccnet-unsigned";

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Cloudinary upload failed");
    }

    const data = await res.json();
    return data.secure_url;
  };

  const handleFiles = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    setLoading(true);
    try {
      const uploaded = await Promise.all(
        selectedFiles.map(async (file) => await uploadToCloudinary(file))
      );
      setCloudinaryUrls((prev) => [...prev, ...uploaded]);
      setMessage({
        type: "success",
        text: `${uploaded.length} image(s) uploaded successfully!`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FIX: Extract string ID if postId is passed as an object, otherwise use as is
    const cleanPostId = typeof postId === "object" ? postId._id : postId;

    if (!cleanPostId) {
      setMessage({ type: "error", text: "Post ID is missing." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload = {
      reason_code: reason.trim(),
      description: description.trim() || "",
      target_type: "post",
      target_ref: cleanPostId,
      evidence_files: cloudinaryUrls,
    };

    try {
      await postAPI.reportPost(cleanPostId, payload);

      setMessage({ type: "success", text: "Report submitted successfully!" });
      setTimeout(() => {
        onClose();
        setReason("");
        setDescription("");
        setCloudinaryUrls([]);
        setMessage(null);
      }, 2500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit report.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">Report Post</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
              ></button>
            </div>
            <div className="modal-body pt-2">
              {message && (
                <div
                  className={`alert alert-${
                    message.type === "success" ? "success" : "danger"
                  } alert-dismissible fade show mb-3`}
                >
                  {message.text}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMessage(null)}
                  ></button>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Reason *</label>
                  <select
                    className={`form-select ${
                      !reason && message?.type === "error" ? "is-invalid" : ""
                    }`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Choose a reason</option>
                    <option value="spam">Spam / Advertising</option>
                    <option value="harassment">Harassment / Bullying</option>
                    <option value="inappropriate">Inappropriate / NSFW</option>
                    <option value="violence">Violence / Threats</option>
                    <option value="hate_speech">Hate Speech</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Additional details (optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us more about why you're reporting this..."
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    Evidence (optional - images)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="form-control"
                    onChange={handleFiles}
                    disabled={loading}
                  />
                  {cloudinaryUrls.length > 0 && (
                    <div className="mt-3 d-flex flex-wrap gap-2">
                      {cloudinaryUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Preview"
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-danger w-100"
                    disabled={loading || !reason.trim()}
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
