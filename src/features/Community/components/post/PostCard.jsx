import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePostMutations } from "../../hooks/usePostMutations";
import { useQuery } from "@tanstack/react-query";
import httpClient from "@/shared/lib/httpClient";
import EditPostModal from "./EditPostModal";
import PostTheaterMode from "./PostTheaterMode";
// CHÚ Ý IMPORT:
import { SharedEntityCard } from "./SharedEntityCard";

const POST_TYPE_LABELS = {
  share_project: "đã chia sẻ một dự án",
  need_help: "đang kêu gọi hỗ trợ",
};

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

const getAuthorName = (author) =>
  author?.fullName || author?.username || "Người ẩn danh";

const Avatar = ({ user, size = "size-10", textSize = "text-lg" }) => {
  const name = getAuthorName(user);
  const profileLink = `/users/${user?._id || user?.id}`;

  if (user?.avatar) {
    return (
      <Link
        to={profileLink}
        className={`bg-center bg-cover rounded-full ring-1 ring-slate-100 shrink-0 block hover:opacity-80 transition-opacity ${size}`}
        style={{ backgroundImage: `url("${user.avatar}")` }}
      />
    );
  }

  return (
    <Link
      to={profileLink}
      className={`bg-yellow-100 text-yellow-700 font-bold flex items-center justify-center rounded-full shrink-0 hover:opacity-80 transition-opacity ${size} ${textSize}`}
    >
      {name.charAt(0).toUpperCase()}
    </Link>
  );
};

const ImageGrid = ({ images, onImageClick }) => {
  if (!images?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-1 px-1">
      {images.map((img, i) => (
        <div
          key={i}
          onClick={() => onImageClick(i)}
          className={`bg-slate-100 aspect-video bg-center bg-cover cursor-pointer hover:opacity-95 transition-opacity ${
            images.length === 1 ? "col-span-2" : ""
          }`}
          style={{ backgroundImage: `url("${img.url}")` }}
        />
      ))}
    </div>
  );
};

// --- COMPONENT CHÍNH POSTCARD ---
const PostCard = ({ post, currentUserId, onReport }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [theaterIndex, setTheaterIndex] = useState(null);

  // (Đã dọn phần xử lý comments vì bạn nói sẽ giữ nguyên phần dưới, nếu cần bạn cứ paste lại state comments vào đây)

  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setShowMenu(false));

  const { toggleReaction, deletePost, toggleSavePost } = usePostMutations();

  if (!post) return null;

  const isAuthor = currentUserId === post?.author?._id;
  const isLiked = post?.userReaction === "like";
  const isDisliked = post?.userReaction === "dislike";
  const stats = post?.stats || { likes: 0, comments: 0 };
  const postDate = post?.createdAt
    ? new Date(post.createdAt).toLocaleDateString("vi-VN")
    : "";

  return (
    <>
      <article className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-visible w-full min-w-0 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar user={post.author} />
            <div>
              <div className="flex items-center flex-wrap gap-1">
                <Link
                  to={`/users/${post.author?._id}`}
                  className="text-slate-900 font-bold text-sm hover:underline"
                >
                  {getAuthorName(post.author)}
                </Link>
                {POST_TYPE_LABELS[post.type] && (
                  <span className="text-slate-500 text-xs font-normal">
                    {POST_TYPE_LABELS[post.type]}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] font-medium uppercase mt-0.5">
                {post.privacy} • {postDate}
              </p>
            </div>
          </div>

          {/* Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-fade-in-down">
                {isAuthor ? (
                  <>
                    <MenuBtn
                      icon="edit"
                      label="Chỉnh sửa bài viết"
                      onClick={() => {
                        setIsEditOpen(true);
                        setShowMenu(false);
                      }}
                    />
                    <MenuBtn
                      icon="delete"
                      label="Xóa bài viết"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm("Xóa bài viết này?"))
                          deletePost.mutate(post._id);
                        setShowMenu(false);
                      }}
                    />
                  </>
                ) : (
                  <>
                    <MenuBtn
                      icon={post.isSaved ? "bookmark_added" : "bookmark"}
                      label={post.isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
                      onClick={() => {
                        toggleSavePost.mutate(post._id);
                        setShowMenu(false);
                      }}
                    />
                    <MenuBtn
                      icon="warning"
                      label="Báo cáo vi phạm"
                      variant="warning"
                      onClick={() => {
                        onReport(post._id);
                        setShowMenu(false);
                      }}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nội dung text */}
        {post.content && (
          <div className="px-5 mb-4">
            <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>
        )}

        {/* HIỂN THỊ THẺ SHARE HOẶC ẢNH */}
        {post.sharedEntity ? (
          <SharedEntityCard entity={post.sharedEntity} isPreview={false} />
        ) : (
          <ImageGrid
            images={post.images}
            onImageClick={(index) => setTheaterIndex(index)}
          />
        )}

        {/* Action Buttons */}
        <div className="px-5 py-3 flex items-center gap-6 border-b border-slate-50 border-t mt-2">
          <ActionBtn
            active={isLiked}
            icon="favorite"
            label={`${stats.likes}`}
            color="text-red-500"
            onClick={() =>
              toggleReaction.mutate({ postId: post._id, type: "like" })
            }
            disabled={!currentUserId}
          />
          <ActionBtn
            active={isDisliked}
            icon="thumb_down"
            color="text-slate-700"
            onClick={() =>
              toggleReaction.mutate({ postId: post._id, type: "dislike" })
            }
            disabled={!currentUserId}
          />
          <Link
            to={`/community/${post._id}`}
            className="flex items-center gap-2 text-slate-500 font-bold text-sm ml-auto hover:text-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              chat_bubble
            </span>
            {stats.comments} Bình luận
          </Link>
        </div>

        {/* Bạn có thể paste lại phần Comment UI ở đây nếu cần */}
      </article>

      {/* Modals */}
      {isEditOpen && (
        <EditPostModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          post={post}
        />
      )}

      {theaterIndex !== null && (
        <PostTheaterMode
          post={post}
          initialIndex={theaterIndex}
          onClose={() => setTheaterIndex(null)}
        />
      )}
    </>
  );
};

// --- COMPONENT PHỤ ---
const MenuBtn = ({ icon, label, onClick, variant = "default" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${
      variant === "danger"
        ? "text-red-600 font-medium"
        : variant === "warning"
          ? "text-orange-600 font-medium"
          : "text-slate-700 font-medium"
    }`}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    {label}
  </button>
);

const ActionBtn = ({ active, icon, label, color, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 font-bold text-sm transition-all p-1 rounded-lg hover:bg-slate-50 ${
      active ? color : "text-slate-500"
    } disabled:opacity-30`}
  >
    <span
      className={`material-symbols-outlined text-[22px] ${active ? "fill-current" : ""}`}
    >
      {icon}
    </span>
    {label && <span>{label}</span>}
  </button>
);

export default PostCard;
