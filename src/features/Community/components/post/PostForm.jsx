import React, { useState, useRef, useEffect } from "react";
import { usePostMutations } from "../../hooks/usePostMutations";
import { useAuthStore } from "../../../auth/stores/useAuthStore";
import { useToast } from "@/shared/contexts/ToastContext";
// CHÚ Ý IMPORT: Đảm bảo đường dẫn này đúng với vị trí file SharedEntityCard của bạn
import { SharedEntityCard } from "./SharedEntityCard";

// --- Sub-component Avatar ---
const UserAvatar = ({ user }) => {
  if (user?.avatar) {
    return (
      <div
        className="size-10 rounded-full ring-2 ring-primary/10 bg-cover bg-center shrink-0"
        style={{ backgroundImage: `url("${user.avatar}")` }}
      />
    );
  }

  const initial = (user?.fullName || user?.username || "U")
    .charAt(0)
    .toUpperCase();
  return (
    <div className="size-10 rounded-full bg-yellow-100 text-yellow-700 font-bold flex items-center justify-center shrink-0 ring-2 ring-yellow-50">
      {initial}
    </div>
  );
};

// --- Sub-component Gallery ảnh ---
const AttachmentGallery = ({ attachments, onRemove }) => {
  if (!attachments.length) return null;

  return (
    <div className="flex gap-3 mt-3 overflow-x-auto pb-2 custom-scrollbar">
      {attachments.map((att, idx) => (
        <div key={idx} className="relative shrink-0 group">
          {att.type.startsWith("video/") ? (
            <video
              src={att.preview}
              className="size-20 object-cover rounded-lg border border-slate-100"
            />
          ) : (
            <img
              src={att.preview}
              alt="xem trước"
              className="size-20 object-cover rounded-lg border border-slate-100"
            />
          )}
          <button
            onClick={() => onRemove(idx)}
            className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full size-5 flex items-center justify-center text-[10px] hover:bg-red-500 shadow-sm"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

// --- Component PostForm CHÍNH ---
const PostForm = ({
  sharedItem = null,
  initialContent = "",
  onPostSuccess,
  onCancelShare,
}) => {
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const { user } = useAuthStore();
  const { createPost } = usePostMutations();
  const toast = useToast();

  const isOverLimit = content.length > 300;

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    return () => attachments.forEach((att) => URL.revokeObjectURL(att.preview));
  }, [attachments]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (attachments.length + selectedFiles.length > 5) {
      return alert("Tối đa 5 file ảnh/video.");
    }
    const newAtts = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }));
    setAttachments((prev) => [...prev, ...newAtts]);
    e.target.value = null;
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (
      (!content.trim() && attachments.length === 0 && !sharedItem) ||
      isOverLimit
    )
      return;

    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("privacy", "public");

    if (sharedItem) {
      const postType =
        sharedItem.entityModel === "Project" ? "share_project" : "need_help";
      formData.append("type", postType);
      console.log("DỮ LIỆU CHUẨN BỊ GỬI LÊN SERVER:", sharedItem);
      formData.append("sharedEntity", JSON.stringify(sharedItem));
    } else {
      formData.append("type", "normal");
      attachments.forEach((att) => formData.append("images", att.file));
    }

    createPost.mutate(formData, {
      onSuccess: () => {
        const successMsg = sharedItem
          ? `Đã chia sẻ ${sharedItem.entityModel === "Project" ? "dự án" : "yêu cầu giúp đỡ"} thành công!`
          : "Đã đăng bài viết mới!";

        toast.success(successMsg);
        setContent("");
        setAttachments([]);
        if (onPostSuccess) onPostSuccess();
      },
      onError: () => {
        toast.error("Không thể đăng bài. Vui lòng thử lại sau!");
      },
    });
  };

  const isPostDisabled =
    (!content.trim() && attachments.length === 0 && !sharedItem) ||
    createPost?.isPending ||
    isOverLimit;

  const placeholderText = sharedItem
    ? "Chia sẻ thêm về điều này..."
    : `${user?.fullName || "Bạn"} đang nghĩ gì vậy?`;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 relative">
      {/* Khối 1: Avatar và Khung nhập chữ */}
      <div className="flex gap-4">
        <UserAvatar user={user} />

        <div className="flex-1 min-w-0">
          <textarea
            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 resize-none outline-none transition-all placeholder:text-slate-400 min-h-[80px] ${
              isOverLimit
                ? "border-red-400 focus:ring-red-400/20 text-red-600 bg-red-50/50"
                : "border-transparent focus:ring-amber-400/20"
            }`}
            placeholder={placeholderText}
            rows="2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div
            className={`flex justify-end items-center mt-1 text-xs font-medium transition-colors ${
              isOverLimit ? "text-red-500" : "text-slate-400"
            }`}
          >
            {isOverLimit && (
              <span className="mr-2">⚠️ Vượt quá giới hạn 300 ký tự!</span>
            )}
            <span>{content.length}/300</span>
          </div>

          {!sharedItem && (
            <AttachmentGallery
              attachments={attachments}
              onRemove={handleRemoveAttachment}
            />
          )}
        </div>
      </div>

      {/* Khối 2: Thẻ Preview nằm dưới, chiếm full chiều rộng (kéo ra lề trái) */}
      {sharedItem && (
        <div className="relative mt-4">
          <SharedEntityCard entity={sharedItem} isPreview={true} />
          {onCancelShare && (
            <button
              onClick={onCancelShare}
              type="button"
              className="absolute -top-2 -right-2 z-30 size-7 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-red-500 shadow-lg transition-all hover:scale-110 active:scale-95"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Input File Ẩn */}
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Khối 3: Các nút hành động */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <div>
          {!sharedItem && (
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium text-xs"
            >
              <span className="material-symbols-outlined text-amber-500">
                image
              </span>
              Ảnh/Video
            </button>
          )}
        </div>

        <button
          onClick={handlePost}
          disabled={isPostDisabled}
          className="bg-amber-400 text-slate-900 text-sm font-bold px-6 py-2 rounded-xl hover:bg-amber-500 shadow-sm shadow-amber-400/30 disabled:opacity-50 transition-all min-w-[100px]"
        >
          {createPost?.isPending ? "Đang đăng..." : "Đăng bài"}
        </button>
      </div>
    </div>
  );
};

export default PostForm;
