import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePostMutations } from "../../hooks/usePostMutations";
import { useQuery } from "@tanstack/react-query";
import httpClient from "@/shared/lib/httpClient";
import EditPostModal from "./EditPostModal";
import PostTheaterMode from "./PostTheaterMode"; // Giả sử bạn dùng chung component này để làm overlay

const POST_TYPE_LABELS = {
  share_project: "shared a project",
  need_help: "is asking for help",
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
  author?.fullName || author?.username || "Anonymous";

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

// --- IMAGE GRID MỚI: Hỗ trợ bấm vào đúng Index ---
const ImageGrid = ({ images, onImageClick }) => {
  if (!images?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-1 px-1">
      {images.map((img, i) => (
        <div
          key={i}
          onClick={() => onImageClick(i)} // Truyền index ra ngoài
          className={`bg-slate-100 aspect-video bg-center bg-cover cursor-pointer hover:opacity-95 transition-opacity ${
            images.length === 1 ? "col-span-2" : ""
          }`}
          style={{ backgroundImage: `url("${img.url}")` }}
        />
      ))}
    </div>
  );
};

const SharedEntityCard = ({ entity }) => {
  const isProject = entity.entityModel === "Project";
  const linkTo = isProject
    ? `/projects/${entity.entityId}`
    : `/need-help/${entity.entityId}`;

  const badgeClass = isProject ? "bg-blue-600" : "bg-red-500";

  const btnClass =
    "bg-amber-400 text-slate-900 hover:bg-amber-500 shadow-sm shadow-amber-400/30";

  return (
    <div className="px-5 pb-4">
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col sm:flex-row relative group hover:shadow-md hover:border-amber-200 transition-all duration-300">
        {/* Khu vực ảnh Thumbnail */}
        <div className="w-full sm:w-[160px] h-[140px] sm:h-auto shrink-0 bg-slate-200 border-b sm:border-b-0 sm:border-r border-slate-100 overflow-hidden relative">
          {entity.thumbnail ? (
            <img
              src={entity.thumbnail}
              alt="Thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium bg-slate-100">
              No Image
            </div>
          )}
          <span
            className={`absolute top-2 left-2 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg shadow-sm text-white tracking-wide ${badgeClass}`}
          >
            {isProject ? "Project" : "Need Help"}
          </span>
        </div>

        {/* Khu vực Nội dung */}
        <div className="p-4 flex flex-col flex-1 min-w-0 bg-white">
          <h4 className="font-bold text-slate-900 line-clamp-2 leading-snug mb-1.5 text-base group-hover:text-amber-600 transition-colors">
            {entity.title}
          </h4>
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {entity.description || "Nhấn để xem chi tiết dự án này..."}
          </p>

          <div className="mt-auto">
            <Link
              to={linkTo}
              className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${btnClass}`}
            >
              {isProject ? "Xem Dự Án" : "Giúp Đỡ Ngay"}
              <span className="material-symbols-outlined text-[18px] ml-1.5 transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, currentUserId, onReport }) => {
  const [commentContent, setCommentContent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // State để quản lý việc mở TheaterMode (chi tiết ảnh)
  const [theaterIndex, setTheaterIndex] = useState(null);

  const [sortMode, setSortMode] = useState("relevant");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [allComments, setAllComments] = useState(
    post?.latestComments || post?.comments || [],
  );

  const menuRef = useRef(null);
  const sortRef = useRef(null);
  useClickOutside(menuRef, () => setShowMenu(false));
  useClickOutside(sortRef, () => setIsSortOpen(false));

  const { toggleReaction, addComment, deletePost, toggleSavePost } =
    usePostMutations();

  const { data: commentsData } = useQuery({
    queryKey: ["postComments", post?._id, page, sortMode],
    queryFn: async () => {
      const res = await httpClient.get(
        `/posts/${post._id}/comments?page=${page}&sort=${sortMode}`,
      );
      return res.data;
    },
    enabled: !!post?._id && page > 0,
  });

  useEffect(() => {
    if (commentsData) {
      const fetchedData =
        commentsData?.data?.data || commentsData?.data || commentsData;
      if (Array.isArray(fetchedData) && fetchedData.length > 0) {
        setAllComments((prev) => {
          const newComments = [...prev, ...fetchedData];
          return Array.from(
            new Map(newComments.map((c) => [c._id, c])).values(),
          );
        });
      }
    }
  }, [commentsData]);

  if (!post) return null;

  const isAuthor = currentUserId === post?.author?._id;
  const isLiked = post?.userReaction === "like";
  const isDisliked = post?.userReaction === "dislike";
  const stats = post?.stats || { likes: 0, comments: 0 };
  const postDate = post?.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : "";

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || addComment.isPending) return;
    try {
      const result = await addComment.mutateAsync({
        postId: post._id,
        content: commentContent,
      });
      const newComment = result?.data || result;
      if (newComment && newComment._id)
        setAllComments((prev) => [newComment, ...prev]);
      setCommentContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSortChange = (mode) => {
    setSortMode(mode);
    setAllComments([]);
    setPage(1);
    setIsSortOpen(false);
  };

  const getSortLabel = () => {
    if (sortMode === "relevant") return "Phù hợp nhất";
    if (sortMode === "newest") return "Mới nhất";
    return "Tất cả bình luận";
  };

  return (
    <>
      <article className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-visible w-full min-w-0">
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
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-50"
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
                      variant="danger"
                      onClick={() => {
                        if (window.confirm("Delete?"))
                          deletePost.mutate(post._id);
                        setShowMenu(false);
                      }}
                    />
                  </>
                ) : (
                  <>
                    <MenuBtn
                      icon={post.isSaved ? "bookmark_added" : "bookmark"}
                      label={post.isSaved ? "Unsave" : "Save"}
                      onClick={() => {
                        toggleSavePost.mutate(post._id);
                        setShowMenu(false);
                      }}
                    />

                    <MenuBtn
                      icon="warning"
                      label="Report"
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

        {post.content && (
          <div className="px-5 mb-4 w-full overflow-hidden">
            <Link
              to={`/community/${post._id}`}
              className="block w-full hover:opacity-90"
            >
              <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap break-words break-all">
                {post.content}
              </p>
            </Link>
          </div>
        )}

        {post.sharedEntity ? (
          <SharedEntityCard entity={post.sharedEntity} />
        ) : (
          <ImageGrid
            images={post.images}
            onImageClick={(index) => setTheaterIndex(index)} // 🚨 MỞ THEATER TẠI INDEX NÀY
          />
        )}

        <div className="px-5 py-4 flex items-center gap-6 border-b border-slate-50 border-t mt-2">
          <ActionBtn
            active={isLiked}
            icon="favorite"
            label={`${stats.likes} Likes`}
            color="text-yellow-500"
            onClick={() =>
              toggleReaction.mutate({ postId: post._id, type: "like" })
            }
            disabled={!currentUserId}
          />
          <ActionBtn
            active={isDisliked}
            icon="thumb_down"
            color="text-red-500"
            onClick={() =>
              toggleReaction.mutate({ postId: post._id, type: "dislike" })
            }
            disabled={!currentUserId}
          />
          <Link
            to={`/community/${post._id}`}
            className="flex items-center gap-2 text-slate-500 font-bold text-sm ml-auto hover:text-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            {stats.comments} Comments
          </Link>
        </div>

        <div className="px-5 pb-5 pt-4 bg-slate-50/50 rounded-b-2xl">
          {/* ... Phần comment giữ nguyên ... */}
        </div>
      </article>

      {isEditOpen && (
        <EditPostModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          post={post}
        />
      )}

      {/* 🚨 CHI TIẾT ẢNH THEO INDEX */}
      {theaterIndex !== null && (
        <PostTheaterMode
          post={post}
          initialIndex={theaterIndex} // Truyền index khởi đầu vào
          onClose={() => setTheaterIndex(null)}
        />
      )}
    </>
  );
};

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
