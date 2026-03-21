import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePostMutations } from "../hooks/usePostMutations";
import EditPostModal from "./EditPostModal";

// --- Helper & Sub-components ---
const getAuthorName = (author) =>
  author?.fullName || author?.username || "Anonymous";

const Avatar = ({ user, size = "size-10", textSize = "text-lg" }) => {
  const name = getAuthorName(user);
  return user?.avatar ? (
    <div
      className={`bg-center bg-cover rounded-full ring-1 ring-slate-100 shrink-0 ${size}`}
      style={{ backgroundImage: `url("${user.avatar}")` }}
    />
  ) : (
    <div
      className={`bg-yellow-100 text-yellow-700 font-bold flex items-center justify-center rounded-full shrink-0 ${size} ${textSize}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const PostCard = ({ post, currentUserId, onReport }) => {
  const [commentContent, setCommentContent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const menuRef = useRef(null);

  const { toggleReaction, addComment, deletePost } = usePostMutations();

  // Logic tóm tắt
  const isAuthor = currentUserId === post?.author?._id;
  const isLiked = post?.userReaction === "like";
  const isDisliked = post?.userReaction === "dislike";
  const stats = post?.stats || { likes: 0, comments: 0 };

  // Click outside to close menu
  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  if (!post) return null;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    addComment.mutate(
      { postId: post._id, content: commentContent },
      { onSuccess: () => setCommentContent("") },
    );
  };

  const handleDelete = () => {
    if (window.confirm("Delete this post?")) deletePost.mutate(post._id);
    setShowMenu(false);
  };

  return (
    <>
      <article className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-visible">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar user={post.author} />
            <div>
              <div className="flex items-center gap-1">
                <Link
                  to={`/community/${post._id}`}
                  className="text-slate-900 font-bold text-sm hover:underline"
                >
                  {getAuthorName(post.author)}
                </Link>
                <span className="material-symbols-outlined text-blue-500 text-[16px] fill-current">
                  verified
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-medium uppercase">
                {post.privacy} • {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Post Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-fade-in-down">
                {isAuthor ? (
                  <>
                    <MenuBtn
                      icon="edit"
                      label="Edit"
                      onClick={() => {
                        setIsEditOpen(true);
                        setShowMenu(false);
                      }}
                    />
                    <MenuBtn
                      icon="delete"
                      label="Delete"
                      onClick={handleDelete}
                      variant="danger"
                    />
                  </>
                ) : (
                  <MenuBtn
                    icon="warning"
                    label="Report"
                    onClick={() => {
                      onReport(post._id);
                      setShowMenu(false);
                    }}
                    variant="warning"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content & Media */}
        <div className="px-5 mb-4">
          <Link to={`/community/${post._id}`} className="block">
            <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </Link>
        </div>

        {post.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-1 px-1">
            {post.images.map((img, i) => (
              <div
                key={i}
                className={`bg-slate-100 aspect-video bg-center bg-cover ${post.images.length === 1 ? "col-span-2" : ""}`}
                style={{ backgroundImage: `url("${img.url}")` }}
              />
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="px-5 py-4 flex items-center gap-6 border-b border-slate-50">
          <ActionBtn
            active={isLiked}
            icon="favorite"
            label={`${stats.likes} Likes`}
            color="text-primary"
            onClick={() =>
              toggleReaction.mutate({ postId: post._id, type: "like" })
            }
            disabled={!currentUserId}
          />
          <ActionBtn
            active={isDisliked}
            icon="thumb_down"
            label=""
            color="text-red-500"
            onClick={() =>
              toggleReaction.mutate({ postId: post._id, type: "dislike" })
            }
            disabled={!currentUserId}
          />
          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm ml-auto">
            <span className="material-symbols-outlined">chat_bubble</span>{" "}
            {stats.comments} Comments
          </div>
        </div>

        {/* Comment Section */}
        <div className="px-5 pb-5 pt-4 bg-slate-50/50">
          <div className="flex flex-col gap-3 mb-4">
            {post.latestComments?.map((comment) => (
              <div key={comment._id} className="flex gap-3 items-start">
                <Avatar
                  user={comment.author}
                  size="size-7"
                  textSize="text-[10px]"
                />
                <div className="text-sm bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex-1">
                  <span className="font-bold text-slate-900 mr-2">
                    {getAuthorName(comment.author)}
                  </span>
                  <span className="text-slate-700">{comment.content}</span>
                </div>
              </div>
            ))}
          </div>

          {currentUserId && (
            <form
              onSubmit={handleCommentSubmit}
              className="flex gap-3 items-center"
            >
              <input
                type="text"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full bg-white border border-slate-200 py-2 px-5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                disabled={addComment.isPending || !commentContent.trim()}
                className="bg-primary text-white text-sm font-bold py-2 px-5 rounded-full hover:bg-yellow-500 disabled:opacity-50"
              >
                {addComment.isPending ? "..." : "Send"}
              </button>
            </form>
          )}
        </div>
      </article>

      <EditPostModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        post={post}
      />
    </>
  );
};

// --- Rút gọn các Button nhỏ ---
const MenuBtn = ({ icon, label, onClick, variant = "default" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 ${variant === "danger" ? "text-red-600" : variant === "warning" ? "text-orange-600" : "text-slate-700"}`}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>{" "}
    {label}
  </button>
);

const ActionBtn = ({ active, icon, label, color, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 font-bold text-sm transition-all ${active ? color : "text-slate-500"} hover:opacity-70 disabled:opacity-30`}
  >
    <span
      className={`material-symbols-outlined ${active ? "fill-current" : ""}`}
    >
      {icon}
    </span>
    {label && <span>{label}</span>}
  </button>
);

export default PostCard;
