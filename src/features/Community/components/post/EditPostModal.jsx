import React, { useState, useRef, useEffect } from "react";
import { usePostMutations } from "../../hooks/usePostMutations";

const EditPostModal = ({ isOpen, onClose, post }) => {
  const [content, setContent] = useState("");
  const [oldImages, setOldImages] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);

  const fileInputRef = useRef(null);
  const { updatePost } = usePostMutations();
  const totalMediaCount = oldImages.length + newAttachments.length;

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content || "");
      setOldImages(post.images || []);
      setRemovedFileIds([]);
      setNewAttachments([]);
    }
  }, [isOpen, post]);

  useEffect(() => {
    return () =>
      newAttachments.forEach((att) => URL.revokeObjectURL(att.preview));
  }, [newAttachments]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (totalMediaCount + files.length > 5) return alert("Tối đa 5 file.");

    const newAtts = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }));
    setNewAttachments((prev) => [...prev, ...newAtts]);
    e.target.value = null;
  };

  const handleRemoveNew = (index) => {
    URL.revokeObjectURL(newAttachments[index].preview);
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && totalMediaCount === 0) return;

    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("privacy", post.privacy || "public");
    removedFileIds.forEach((id) => formData.append("removeFiles", id));
    newAttachments.forEach((att) => formData.append("images", att.file));

    updatePost.mutate({ postId: post._id, formData }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h5 className="font-bold text-xl text-slate-900">Edit Post</h5>
          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-red-500"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 resize-none outline-none mb-4"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
          />

          {/* Media Preview Section */}
          {totalMediaCount > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2">
              {/* Old Images */}
              {oldImages.map((img) => (
                <MediaItem
                  key={img.publicId}
                  src={img.url}
                  onRemove={() => {
                    setOldImages((prev) =>
                      prev.filter((i) => i.publicId !== img.publicId),
                    );
                    setRemovedFileIds((prev) => [...prev, img.publicId]);
                  }}
                  isOld
                />
              ))}
              {/* New Attachments */}
              {newAttachments.map((att, idx) => (
                <MediaItem
                  key={idx}
                  src={att.preview}
                  type={att.type}
                  onRemove={() => handleRemoveNew(idx)}
                />
              ))}
            </div>
          )}

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium mb-4"
          >
            <span className="material-symbols-outlined text-[20px]">
              add_photo_alternate
            </span>
            Add More Media
          </button>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={updatePost?.isPending}
              className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:opacity-90 disabled:opacity-50 min-w-[120px]"
            >
              {updatePost?.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaItem = ({ src, type, onRemove, isOld }) => (
  <div
    className={`relative shrink-0 ${!isOld ? "border-2 border-primary rounded-lg" : ""}`}
  >
    {type?.startsWith("video/") ? (
      <video src={src} className="w-20 h-20 object-cover rounded-lg" />
    ) : (
      <img
        src={src}
        alt="preview"
        className={`w-20 h-20 object-cover rounded-lg ${isOld ? "opacity-80" : ""}`}
      />
    )}
    <button
      onClick={onRemove}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-5 flex items-center justify-center text-xs shadow-md"
    >
      ×
    </button>
  </div>
);

export default EditPostModal;
