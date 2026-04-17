import React from "react";
import PostForm from "../post/PostForm";

export const ShareModal = ({
  isOpen,
  onClose,
  sharedData,
  initialText = "Mọi người xem dự án mới của mình nhé! ",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header của Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="font-extrabold text-lg text-slate-900 m-0">
            {sharedData?.entityModel === "Project"
              ? "Chia sẻ dự án"
              : "Kêu gọi hỗ trợ"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 size-8 flex items-center justify-center rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 bg-slate-50 overflow-y-auto">
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
