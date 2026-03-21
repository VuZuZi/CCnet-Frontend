import React, { useState, useRef, useEffect } from "react";
import { usePostMutations } from "../hooks/usePostMutations";
// Import store của bạn (đảm bảo đúng đường dẫn)
import { useAuthStore } from "../../auth/stores/useAuthStore";

const PostForm = () => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const { user } = useAuthStore();
  const { createPost } = usePostMutations();

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

  const handlePost = () => {
    if (!content.trim() && attachments.length === 0) return;
    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("privacy", "public");
    attachments.forEach((att) => formData.append("images", att.file));

    createPost.mutate(formData, {
      onSuccess: () => {
        setContent("");
        setAttachments([]);
      },
    });
  };

  // Logic lấy chữ cái đầu nếu không có avatar
  const userInitial = (user?.fullName || user?.username || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
      <div className="flex gap-4">
        {/* 2. Hiển thị Avatar động */}
        {user?.avatar ? (
          <div
            className="size-10 rounded-full ring-2 ring-primary/10 bg-cover bg-center shrink-0"
            style={{ backgroundImage: `url("${user.avatar}")` }}
          />
        ) : (
          <div className="size-10 rounded-full bg-yellow-100 text-yellow-700 font-bold flex items-center justify-center shrink-0 ring-2 ring-yellow-50">
            {userInitial}
          </div>
        )}

        <div className="flex-1">
          <textarea
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 resize-none outline-none transition-all placeholder:text-slate-400"
            placeholder={`What's on your mind, ${user?.fullName || "friend"}?`}
            rows="2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {attachments.length > 0 && (
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
                      alt="preview"
                      className="size-20 object-cover rounded-lg border border-slate-100"
                    />
                  )}
                  <button
                    onClick={() =>
                      setAttachments((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full size-5 flex items-center justify-center text-[10px] hover:bg-red-500 shadow-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        multiple
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <button
          onClick={() => fileInputRef.current.click()}
          className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium text-xs"
        >
          <span className="material-symbols-outlined text-primary">image</span>
          Photo/Video
        </button>

        <button
          onClick={handlePost}
          disabled={
            (!content.trim() && attachments.length === 0) ||
            createPost?.isPending
          }
          className="bg-primary text-white text-sm font-bold px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 transition-all min-w-[100px]"
        >
          {createPost?.isPending ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default PostForm;
