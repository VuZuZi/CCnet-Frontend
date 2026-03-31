import React, { useState, useRef, useEffect } from "react";
import { usePostMutations } from "../../hooks/usePostMutations";
import { useAuthStore } from "../../../auth/stores/useAuthStore";

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

const SharedItemPreview = ({ item, onCancel }) => {
  const isProject = item.entityModel === "Project";
  const badgeColor = isProject ? "text-blue-600" : "text-red-500";
  const badgeText = isProject ? "🚀 Project Showcase" : "🆘 Need Help";

  return (
    <div className="mt-3 relative border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col sm:flex-row group">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white rounded-full size-6 flex items-center justify-center text-xs backdrop-blur-sm transition-colors z-10"
        >
          ✕
        </button>
      )}

      <div className="w-full sm:w-[140px] h-[100px] sm:h-auto shrink-0 bg-slate-100 border-b sm:border-b-0 sm:border-r border-slate-200">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
            No Image
          </div>
        )}
      </div>
      <div className="p-3.5 flex flex-col justify-center min-w-0">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${badgeColor}`}
        >
          {badgeText}
        </span>
        <h4 className="font-bold text-slate-900 truncate leading-tight mb-1 text-sm">
          {item.title}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {item.description || "Click to view details..."}
        </p>
      </div>
    </div>
  );
};

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
              alt="preview"
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
    if (!content.trim() && attachments.length === 0 && !sharedItem) return;

    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("privacy", "public");

    if (sharedItem) {
      const postType =
        sharedItem.entityModel === "Project" ? "share_project" : "need_help";
      formData.append("type", postType);
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
    createPost?.isPending;
  const placeholderText = sharedItem
    ? "Say something about this..."
    : `What's on your mind, ${user?.fullName || "friend"}?`;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 relative">
      <div className="flex gap-4">
        <UserAvatar user={user} />

        <div className="flex-1 min-w-0">
          <textarea
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 resize-none outline-none transition-all placeholder:text-slate-400 min-h-[80px]"
            placeholder={placeholderText}
            rows="2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {sharedItem && (
            <SharedItemPreview item={sharedItem} onCancel={onCancelShare} />
          )}

          {!sharedItem && (
            <AttachmentGallery
              attachments={attachments}
              onRemove={handleRemoveAttachment}
            />
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
        <div>
          {!sharedItem && (
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium text-xs"
            >
              <span className="material-symbols-outlined text-primary">
                image
              </span>
              Photo/Video
            </button>
          )}
        </div>

        <button
          onClick={handlePost}
          disabled={isPostDisabled}
          className="bg-primary text-white text-sm font-bold px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 transition-all min-w-[100px]"
        >
          {createPost?.isPending ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default PostForm;
