import React, { useState, useRef, useEffect } from "react";
import { usePostMutations } from "../../hooks/usePostMutations";
import { Globe2, Lock, X, ImagePlus } from "lucide-react";

const PRIVACY_OPTIONS = [
  { value: "public", label: "Công khai", description: "Ai cũng xem được", icon: Globe2 },
  { value: "private", label: "Riêng tư", description: "Chỉ bạn và người theo dõi mới xem", icon: Lock },
];

const EditPostModal = ({ isOpen, onClose, post }) => {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [oldImages, setOldImages] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);

  const fileInputRef = useRef(null);
  const { updatePost } = usePostMutations();
  const totalMediaCount = oldImages.length + newAttachments.length;
  const isOverLimit = content.length > 5000;

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content || "");
      setPrivacy(post.privacy || "public");
      setOldImages(post.images || []);
      setRemovedFileIds([]);
      setNewAttachments([]);
    }
  }, [isOpen, post]);

  useEffect(() => {
    return () =>
      newAttachments.forEach((att) => URL.revokeObjectURL(att.preview));
  }, [newAttachments]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (totalMediaCount + files.length > 10)
      return alert("Tối đa 10 tệp đính kèm.");

    const newAtts = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }));
    setNewAttachments((prev) => [...prev, ...newAtts]);
    e.target.value = null;
  };

  const handleRemoveNew = (index) => {
    URL.revokeObjectURL(newAttachments[index].preview);
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!content.trim() && totalMediaCount === 0) || isOverLimit) return;

    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("privacy", privacy);
    removedFileIds.forEach((id) => formData.append("removeFiles", id));
    newAttachments.forEach((att) => formData.append("images", att.file));

    updatePost.mutate({ postId: post._id, formData }, { onSuccess: onClose });
  };

  const isSubmitDisabled =
    (!content.trim() && totalMediaCount === 0) ||
    updatePost?.isPending ||
    isOverLimit;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Đóng"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">Chỉnh sửa bài viết</h3>
            <p className="mt-1 text-sm text-slate-500">
              Thay đổi nội dung, ảnh hoặc quyền riêng tư của bài viết.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Đóng popup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto bg-slate-50 p-4 sm:p-6 flex-1">
          {/* Privacy selector */}
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1">
            {PRIVACY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = privacy === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPrivacy(option.value)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-amber-50 text-amber-800 shadow-sm border border-amber-200"
                      : "text-slate-500 hover:text-slate-700 border border-transparent"
                  }`}
                  title={option.description}
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Content textarea */}
          <textarea
            className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm focus:ring-2 resize-none outline-none transition-all placeholder:text-slate-400 min-h-[130px] ${
              isOverLimit
                ? "border-red-400 focus:ring-red-400/20 text-red-600 bg-red-50/50"
                : "border-slate-200 focus:ring-amber-400/20 focus:border-amber-300"
            }`}
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn đang nghĩ gì?"
          />

          <div className={`flex justify-end items-center mt-1.5 text-xs font-medium transition-colors ${
            isOverLimit ? "text-red-500" : "text-slate-400"
          }`}>
            {isOverLimit && <span className="mr-2">⚠️ Vượt quá giới hạn!</span>}
            <span>{content.length}/5000</span>
          </div>

          {/* Media Preview Section */}
          {totalMediaCount > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {/* Old Images */}
              {oldImages.map((img) => (
                <MediaItem
                  key={img.publicId}
                  src={img.url}
                  onRemove={() => {
                    setOldImages((prev) =>
                      prev.filter((i) => i.publicId !== img.publicId),
                    );
                    setRemovedFileIds((prev) => [...prev, img.publicId]);
                  }}
                  isOld
                />
              ))}
              {/* New Attachments */}
              {newAttachments.map((att, idx) => (
                <MediaItem
                  key={idx}
                  src={att.preview}
                  type={att.type}
                  onRemove={() => handleRemoveNew(idx)}
                />
              ))}
            </div>
          )}

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6 bg-white">
          <button
            onClick={() => fileInputRef.current.click()}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-xs"
          >
            <ImagePlus size={16} className="text-amber-500" />
            Thêm ảnh/video
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-2.5 text-sm font-black text-slate-900 shadow-sm shadow-amber-400/30 transition-all hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatePost?.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaItem = ({ src, type, onRemove, isOld }) => (
  <div className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
    {type?.startsWith("video/") ? (
      <video src={src} className="w-full h-full object-cover" />
    ) : (
      <img
        src={src}
        alt="xem trước"
        className="w-full h-full object-cover"
      />
    )}
    {isOld && (
      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/50 text-white">
        Hiện tại
      </div>
    )}
    {!isOld && (
      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-900">
        Mới
      </div>
    )}
    <button
      onClick={onRemove}
      className="absolute top-1.5 right-1.5 size-6 flex items-center justify-center rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all shadow-md"
    >
      ×
    </button>
  </div>
);

export default EditPostModal;
