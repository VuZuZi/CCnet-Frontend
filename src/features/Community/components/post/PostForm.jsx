import React, { useState, useRef, useEffect } from "react";
import { usePostMutations } from "../../hooks/usePostMutations";
import { useAuthStore } from "../../../auth/stores/useAuthStore";
import { Globe2, Lock, ImagePlus, SendHorizontal } from "lucide-react";
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

  const visibleAttachments = attachments.slice(0, 4);
  const remainingCount = attachments.length - visibleAttachments.length;
  const singleItem = visibleAttachments.length === 1;

  return (
    <div
      className={`mt-4 grid gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${
        singleItem ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {visibleAttachments.map((att, idx) => {
        const isVideo = att.type.startsWith("video/");

        return (
          <div
            key={idx}
            className={`group relative overflow-hidden bg-slate-100 ${
              singleItem ? "aspect-[4/3]" : idx === 0 && attachments.length === 3 ? "row-span-2 aspect-[4/5]" : "aspect-square"
            }`}
          >
            {isVideo ? (
              <video
                src={att.preview}
                className="h-full w-full object-cover"
                controls
              />
            ) : (
              <img
                src={att.preview}
                alt="xem trước"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            )}

            {remainingCount > 0 && idx === 3 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-2xl font-black text-white backdrop-blur-[1px]">
                +{remainingCount}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 shadow-md transition-opacity hover:bg-red-500 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

// --- Component PostForm CHÍNH ---
const PostForm = ({
  sharedItem = null,
  initialContent = "",
  onPostSuccess,
  onCancelShare,
  defaultPrivacy = "public",
  showPrivacySelector = true,
  compact = false,
  embedded = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState([]);
  const [privacy, setPrivacy] = useState(defaultPrivacy);
  const fileInputRef = useRef(null);

  const { user } = useAuthStore();
  const { createPost } = usePostMutations();

  const isOverLimit = content.length > 300;

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    setPrivacy(defaultPrivacy);
  }, [defaultPrivacy]);

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
    formData.append("privacy", privacy);

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
        setContent("");
        setAttachments([]);
        if (onPostSuccess) onPostSuccess();
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

  const privacyOptions = [
    { value: "public", label: "Công khai", description: "Ai cũng xem được", icon: Globe2 },
    { value: "private", label: "Riêng tư", description: "Chỉ người theo dõi mới xem", icon: Lock },
  ];

  return (
    <div className={`relative ${embedded ? "w-full" : `bg-white rounded-[28px] border border-slate-200 shadow-sm mb-6 ${compact ? "p-4 sm:p-5" : "p-5 sm:p-6"}`}`}>
      <div className={`flex gap-4 ${embedded ? "" : ""}`}>
        <UserAvatar user={user} />

        <div className="flex-1 min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">Tạo bài viết</p>
              <p className="text-xs text-slate-500">Chia sẻ ngay trên tường cá nhân hoặc bảng tin</p>
            </div>

            {showPrivacySelector && (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                {privacyOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = privacy === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPrivacy(option.value)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                      title={option.description}
                    >
                      <Icon size={14} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <textarea
            className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm focus:ring-2 resize-none outline-none transition-all placeholder:text-slate-400 min-h-[110px] ${
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

      <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-4 pt-4 border-t border-slate-100 ${embedded ? "pb-0" : ""}`}>
        <div>
          {!sharedItem && (
            <button
              onClick={() => fileInputRef.current.click()}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-xs"
            >
              <ImagePlus size={16} className="text-amber-500" />
              Ảnh/Video
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePost}
            disabled={isPostDisabled}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-900 shadow-sm shadow-amber-400/30 transition-all hover:bg-amber-500 disabled:opacity-50"
          >
            <SendHorizontal size={16} />
            {createPost?.isPending ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
