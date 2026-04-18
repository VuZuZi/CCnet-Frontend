import React, { useEffect } from "react";
import { X } from "lucide-react";
import PostForm from "./PostForm";

export function CreatePostModal({
  isOpen,
  onClose,
  title = "Tạo bài viết",
  subtitle = "Chia sẻ khoảnh khắc, suy nghĩ hoặc điều bạn muốn mọi người biết.",
  initialContent = "",
  defaultPrivacy = "public",
  showPrivacySelector = true,
  sharedItem = null,
}) {
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

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Đóng"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
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

        <div className="overflow-y-auto bg-slate-50 p-4 sm:p-6">
          <PostForm
            embedded
            compact
            initialContent={initialContent}
            defaultPrivacy={defaultPrivacy}
            showPrivacySelector={showPrivacySelector}
            sharedItem={sharedItem}
            onPostSuccess={onClose}
            onCancelShare={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;