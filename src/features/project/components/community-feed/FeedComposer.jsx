import { Lock, ImagePlus, SendHorizontal } from "lucide-react";
import FeedUserAvatar from "./FeedUserAvatar";

export function FeedComposer({
  user,
  canPost,
  postContent,
  setPostContent,
  postMedia,
  setPostMedia,
  createPost,
  onCreatePost,
  onMediaUpload,
  onDonateClick,
  fileInputRef,
  postLockedPlaceholder,
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <FeedUserAvatar user={user} />

        <div className="flex-1 space-y-3">
          <div
            className={`rounded-2xl border p-3 transition ${
              canPost
                ? "border-slate-200 bg-slate-50/70"
                : "border-amber-200 bg-amber-50/70"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              {!canPost ? <Lock size={14} /> : null}
              {canPost
                ? "Tạo bài viết mới"
                : "Khu vực này đang bị khóa với tài khoản hiện tại"}
            </div>

            <textarea
              className="min-h-[96px] w-full resize-y rounded-xl border border-transparent bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder={
                canPost
                  ? "Chia sẻ cập nhật mới về tiến độ, hoạt động, hoặc lời cảm ơn..."
                  : postLockedPlaceholder
              }
              disabled={!canPost || createPost.isPending}
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
            />
          </div>

          {postMedia ? (
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {postMedia.type === "image" ? (
                <img
                  alt="preview"
                  className="max-h-80 w-full object-cover"
                  src={postMedia.preview}
                />
              ) : (
                <video
                  className="max-h-80 w-full object-cover"
                  src={postMedia.preview}
                  controls
                />
              )}

              <button
                type="button"
                onClick={() => setPostMedia(null)}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!canPost || createPost.isPending}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  !canPost || createPost.isPending
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                }`}
                title="Upload ảnh hoặc video"
              >
                <ImagePlus size={16} />
                Ảnh/Video
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={onMediaUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onDonateClick}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black shadow-sm transition-colors hover:bg-primary-hover"
              >
                Donate
              </button>

              <button
                type="button"
                onClick={onCreatePost}
                disabled={
                  !canPost ||
                  (!postContent.trim() && !postMedia) ||
                  createPost.isPending
                }
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  !canPost ||
                  (!postContent.trim() && !postMedia) ||
                  createPost.isPending
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                <SendHorizontal size={14} />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedComposer;