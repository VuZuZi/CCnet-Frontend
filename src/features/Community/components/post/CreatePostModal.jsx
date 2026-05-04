import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";
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
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/55 px-3 py-4 sm:px-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Đóng"
      />

      <div className="relative z-10 flex h-auto max-h-[calc(100vh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100vh-48px)]">
        <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-xl font-black text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              aria-label="Đóng popup"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
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
    </div>,
    document.body,
  );
}

export default CreatePostModal;