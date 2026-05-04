import React, { useState, useRef, useEffect } from "react";
import { usePostMutations } from "../../hooks/usePostMutations";
import { useAuthStore } from "../../../auth/stores/useAuthStore";
import { Globe2, Lock, ImagePlus, SendHorizontal } from "lucide-react";
import { SharedEntityCard } from "./SharedEntityCard";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const UserAvatar = ({ user }) => {
  if (user?.avatar) {
    return (
      <div
        className="size-10 shrink-0 rounded-full bg-cover bg-center ring-2 ring-primary/10"
        style={{ backgroundImage: `url("${user.avatar}")` }}
      />
    );
  }

  const initial = (user?.fullName || user?.username || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 font-bold text-yellow-700 ring-2 ring-yellow-50">
      {initial}
    </div>
  );
};

const AttachmentGallery = ({ attachments, onRemove }) => {
  if (!attachments.length) return null;

  const visibleAttachments = attachments.slice(0, MAX_IMAGES);
  const remainingCount = attachments.length - visibleAttachments.length;
  const count = visibleAttachments.length;

  const getGridClass = () => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-2";
  };

  const getItemClass = (index) => {
    if (count === 1) {
      return "h-[260px] sm:h-[320px]";
    }

    if (count === 2) {
      return "h-[190px] sm:h-[240px]";
    }

    if (count === 3 && index === 0) {
      return "row-span-2 h-[260px] sm:h-[320px]";
    }

    return "h-[125px] sm:h-[156px]";
  };

  return (
    <div className="mt-4 max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
      <div className={`grid gap-2 ${getGridClass()}`}>
        {visibleAttachments.map((att, idx) => (
          <div
            key={`${att.file.name}-${idx}`}
            className={`group relative overflow-hidden rounded-xl bg-slate-100 ${getItemClass(idx)}`}
          >
            <img
              src={att.preview}
              alt={att.file.name || "Ảnh xem trước"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {remainingCount > 0 && idx === MAX_IMAGES - 1 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-2xl font-black text-white backdrop-blur-[1px]">
                +{remainingCount}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/55 text-white opacity-100 shadow-md transition hover:bg-red-500 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Xóa ảnh"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

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
    return () => {
      attachments.forEach((att) => URL.revokeObjectURL(att.preview));
    };
  }, [attachments]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length !== selectedFiles.length) {
      alert("Hiện tại bài viết cộng đồng chỉ hỗ trợ ảnh. Vui lòng chọn file ảnh.");
      event.target.value = null;
      return;
    }

    const oversizedFile = imageFiles.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversizedFile) {
      alert("Mỗi ảnh tối đa 5MB.");
      event.target.value = null;
      return;
    }

    if (attachments.length + imageFiles.length > MAX_IMAGES) {
      alert(`Tối đa ${MAX_IMAGES} ảnh mỗi bài viết.`);
      event.target.value = null;
      return;
    }

    const newAttachments = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    event.target.value = null;
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => {
      const removed = prev[index];

      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const buildSafeSharedItem = (item) => {
    if (!item) return null;

    return {
      ...item,
      title: item.title ? String(item.title).slice(0, 200) : "",
      description: item.description ? String(item.description).slice(0, 500) : "",
      ownerName: item.ownerName ? String(item.ownerName).slice(0, 100) : "",
      location: item.location ? String(item.location).slice(0, 200) : "",
      endDateText: item.endDateText
        ? String(item.endDateText).slice(0, 100)
        : "",
    };
  };

  const handlePost = () => {
    if (
      (!content.trim() && attachments.length === 0 && !sharedItem) ||
      isOverLimit ||
      createPost?.isPending
    ) {
      return;
    }

    const formData = new FormData();

    formData.append("content", content.trim());
    formData.append("privacy", privacy);

    if (sharedItem) {
      const postType =
        sharedItem.entityModel === "Project" ? "share_project" : "need_help";

      const safeSharedItem = buildSafeSharedItem(sharedItem);

      formData.append("type", postType);
      formData.append("sharedEntity", JSON.stringify(safeSharedItem));
    } else {
      formData.append("type", "normal");
      attachments.forEach((att) => {
        formData.append("images", att.file);
      });
    }

    createPost.mutate(formData, {
      onSuccess: () => {
        attachments.forEach((att) => URL.revokeObjectURL(att.preview));
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
    {
      value: "public",
      label: "Công khai",
      description: "Ai cũng xem được",
      icon: Globe2,
    },
    {
      value: "private",
      label: "Riêng tư",
      description: "Chỉ người theo dõi mới xem",
      icon: Lock,
    },
  ];

  return (
    <div
      className={`relative ${
        embedded
          ? "w-full"
          : `mb-6 rounded-[28px] border border-slate-200 bg-white shadow-sm ${
              compact ? "p-4 sm:p-5" : "p-5 sm:p-6"
            }`
      }`}
    >
      <div className="flex gap-4">
        <UserAvatar user={user} />

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">Tạo bài viết</p>
              <p className="text-xs text-slate-500">
                Chia sẻ ngay trên tường cá nhân hoặc bảng tin
              </p>
            </div>

            {showPrivacySelector && (
              <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
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
            className={`max-h-[180px] min-h-[110px] w-full resize-none rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
              isOverLimit
                ? "border-red-400 bg-red-50/50 text-red-600 focus:ring-red-400/20"
                : "border-transparent focus:ring-amber-400/20"
            }`}
            placeholder={placeholderText}
            rows="2"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <div
            className={`mt-1 flex items-center justify-end text-xs font-medium transition-colors ${
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

      {sharedItem && (
        <div className="relative mt-4 max-h-[360px] overflow-y-auto">
          <SharedEntityCard entity={sharedItem} isPreview />

          {onCancelShare && (
            <button
              onClick={onCancelShare}
              type="button"
              className="absolute -right-2 -top-2 z-30 flex size-7 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-500 active:scale-95"
              aria-label="Hủy chia sẻ"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className={`mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between ${
          embedded ? "pb-0" : ""
        }`}
      >
        <div>
          {!sharedItem && (
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <ImagePlus size={16} className="text-amber-500" />
              Ảnh
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handlePost}
            disabled={isPostDisabled}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-900 shadow-sm shadow-amber-400/30 transition-all hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
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