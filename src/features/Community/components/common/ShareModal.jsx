import React from "react";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";
import PostForm from "../post/PostForm";

export const ShareModal = ({ isOpen, onClose, sharedData, initialText }) => {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="ccnet-modal-overlay fixed inset-0 z-[1050] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Tắt fadeInUp, chỉ dùng fadeIn để hiện ngay lập tức */}
      <div className="ccnet-modal-panel relative flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="m-0 text-lg font-extrabold text-slate-900">
            {sharedData?.entityModel === "Project"
              ? "Chia sẻ dự án"
              : "Kêu gọi hỗ trợ"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="ccnet-modal-scroll overflow-y-auto bg-slate-50/30 p-4">
          <PostForm
            sharedItem={sharedData}
            initialContent={initialText}
            onPostSuccess={onClose}
            onCancelShare={onClose}
          />
        </div>
      </div>
    </div>
  );
};
