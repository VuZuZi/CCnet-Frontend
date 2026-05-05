import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePostMutations } from "../../hooks/usePostMutations";
import EditPostModal from "./EditPostModal";
import PostTheaterMode from "./PostTheaterMode";
import TextOnlyPostView from "./TextOnlyPostView";
// CHÚ Ý IMPORT:
import { SharedEntityCard } from "./SharedEntityCard";

const POST_TYPE_LABELS = {
  share_project: "đã chia sẻ một dự án",
  need_help: "đang kêu gọi hỗ trợ",
};

const PRIVACY_LABELS = {
  public: { label: "Công khai", icon: "public" },
  private: { label: "Riêng tư", icon: "lock" },
  friends: { label: "Bạn bè", icon: "group" },
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffWeek < 4) return `${diffWeek} tuần trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

const HeartIcon = ({ filled, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "0" : "2"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

 

const CommentIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const Avatar = ({ user, size = "size-10", textSize = "text-lg" }) => {
  const name = getAuthorName(user);
  const profileLink = `/users/${user?._id || user?.id}`;

  if (user?.avatar) {
    return (
      <Link
        to={profileLink}
        className={`bg-center bg-cover rounded-full ring-2 ring-white shadow-sm shrink-0 block hover:opacity-80 transition-opacity ${size}`}
        style={{ backgroundImage: `url("${user.avatar}")` }}
      />
    );
  }

  return (
    <Link
      to={profileLink}
      className={`bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-700 font-bold flex items-center justify-center rounded-full shrink-0 hover:opacity-80 transition-opacity ring-2 ring-white shadow-sm ${size} ${textSize}`}
    >
      {name.charAt(0).toUpperCase()}
    </Link>
  );
};

const ImageGrid = ({ images, onImageClick }) => {
  if (!images?.length) return null;

  const getImageSrc = (img) => img?.url || img?.preview || img;
  const count = images.length;
  const visibleImages = images.slice(0, 5);
  const remainingCount = count - 5;

  const getGridClass = () => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2 grid-rows-2";
    if (count === 4) return "grid-cols-2 grid-rows-2";
    return "grid-cols-6 grid-rows-2";
  };

  const getItemClassName = (index) => {
    if (count === 1) return "col-span-1 aspect-[16/10]";
    if (count === 2) return "aspect-[4/5]";
    if (count === 3) {
      if (index === 0) return "row-span-2 aspect-auto h-full";
      return "aspect-square";
    }
    if (count === 4) return "aspect-square";
    if (index < 3) return "col-span-2 aspect-[4/3]";
    return "col-span-3 aspect-[16/9]";
  };

  return (
    <div className={`grid gap-0.5 overflow-hidden ${getGridClass()}`}>
      {visibleImages.map((img, i) => (
        <div
          key={i}
          onClick={() => onImageClick(i)}
          className={`relative overflow-hidden bg-slate-100 bg-center bg-cover cursor-pointer hover:brightness-[0.92] transition-all duration-200 ${getItemClassName(i)}`}
          style={{ backgroundImage: `url("${getImageSrc(img)}")` }}
        >
          {i === 4 && remainingCount > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-3xl font-black text-white backdrop-blur-[2px]">
              +{remainingCount}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

// --- COMPONENT CHÍNH POSTCARD ---
const PostCard = ({ post, currentUserId, onReport }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [theaterIndex, setTheaterIndex] = useState(null);
  const [isCommentViewOpen, setIsCommentViewOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setShowMenu(false));

  const { toggleReaction, deletePost, toggleSavePost, addComment } = usePostMutations();

  if (!post) return null;

  const isAuthor = currentUserId === post?.author?._id;
  const isLiked = post?.userReaction === "like";
  const stats = post?.stats || { likes: 0, comments: 0 };
  const relativeTime = getRelativeTime(post?.createdAt);
  const privacyInfo = PRIVACY_LABELS[post?.privacy] || PRIVACY_LABELS.public;

  const openCommentView = () => {
    setIsCommentViewOpen(true);
  };

  return (
    <>
      <article
        id={post?._id ? `post-${post._id}` : undefined}
        data-post-id={post?._id || undefined}
        className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-hidden w-full min-w-0 hover:shadow-md transition-shadow duration-300"
      >
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar user={post.author} />
            <div>
              <div className="flex items-center flex-wrap gap-1">
                <Link
                  to={`/users/${post.author?._id}`}
                  className="text-slate-900 font-bold text-[14px] hover:underline"
                >
                  {getAuthorName(post.author)}
                </Link>
                {POST_TYPE_LABELS[post.type] && (
                  <span className="text-slate-500 text-xs font-normal">
                    {POST_TYPE_LABELS[post.type]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-slate-400 text-[11px] font-medium">
                  {relativeTime}
                </span>
                <span className="text-slate-300 text-[11px]">·</span>
                <span
                  className="inline-flex items-center gap-0.5 text-slate-400 text-[11px] font-medium"
                  title={privacyInfo.label}
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {privacyInfo.icon}
                  </span>
                  {privacyInfo.label}
                </span>
                {post.isEdited && (
                  <>
                    <span className="text-slate-300 text-[11px]">·</span>
                    <span className="text-slate-400 text-[11px] italic">
                      Đã chỉnh sửa
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                more_horiz
              </span>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
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
                      icon="flag"
                      label="Báo cáo bài viết"
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
          <div className="px-5 pb-3 w-full overflow-hidden">
            <Link
              to={`/community/${post._id}`}
              className="block w-full"
            >
              <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {post.content}
              </p>
            </Link>
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

        {(stats.likes > 0 || stats.comments > 0) && (
          <div className="mx-5 py-2.5 flex items-center justify-between text-[13px] text-slate-500">
            {stats.likes > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center size-[22px] rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-sm">
                  <HeartIcon filled className="size-3 text-white" />
                </span>
                <span className="font-medium">{stats.likes}</span>
              </span>
            ) : (
              <span />
            )}
            {stats.comments > 0 && (
              <button
                onClick={openCommentView}
                className="hover:underline font-medium cursor-pointer text-slate-500 hover:text-slate-700"
              >
                {stats.comments} bình luận
              </button>
            )}
          </div>
        )}

        <div className="mx-5 py-1 flex items-center border-t border-slate-100">
          <button
            onClick={() =>
              toggleReaction.mutate({ postId: post._id, type: "like" })
            }
            disabled={!currentUserId}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-[13px] transition-all duration-200 active:scale-95 disabled:opacity-30
              ${
                isLiked
                  ? "text-rose-500 hover:bg-rose-50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
          >
            <HeartIcon filled={isLiked} className="size-5" />
            <span>Thích</span>
          </button>
          <button
            onClick={openCommentView}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 active:scale-95"
          >
            <CommentIcon className="size-5" />
            <span>Bình luận</span>
          </button>
        </div>
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

      {isCommentViewOpen && (
        <TextOnlyPostView
          post={post}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          toggleReaction={toggleReaction}
          addComment={addComment}
          onClose={() => setIsCommentViewOpen(false)}
        />
      )}
    </>
  );
};

// ─── SUB-COMPONENTS ───
const MenuBtn = ({ icon, label, onClick, variant = "default" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors
      ${
        variant === "danger"
          ? "text-red-600 hover:bg-red-50"
          : variant === "warning"
            ? "text-orange-600 hover:bg-orange-50"
            : "text-slate-700 hover:bg-slate-50"
      }`}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
    {label}
  </button>
);


export default PostCard;
