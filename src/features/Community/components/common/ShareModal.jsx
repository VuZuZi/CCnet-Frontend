import React from "react";
import PostForm from "../post/PostForm";

export const ShareModal = ({ isOpen, onClose, sharedData, initialText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Tắt fadeInUp, chỉ dùng fadeIn để hiện ngay lập tức */}
      <div className="relative flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-[fadeIn_0.2s_ease-out]">
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

        <div className="overflow-y-auto p-4 bg-slate-50/30">
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
