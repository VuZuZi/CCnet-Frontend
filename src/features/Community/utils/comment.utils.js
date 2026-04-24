export const COMMENT_SORT_OPTIONS = [
  { value: "relevant", label: "Phù hợp nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "all", label: "Tất cả bình luận" },
];

export const getPostId = (post) => post?._id || post?.id || "";

export const getCommentId = (comment) =>
  comment?._id ||
  comment?.id ||
  comment?.tempId ||
  `${comment?.author?._id || "anon"}-${comment?.createdAt || ""}-${comment?.content || ""}`;

export const getInitialComments = (post) => {
  const comments = post?.latestComments || post?.comments || [];
  return Array.isArray(comments) ? comments : [];
};

export const getCommentTotal = (post) => {
  const total = Number(post?.stats?.comments ?? post?.commentCount ?? 0);
  return Number.isFinite(total) ? total : 0;
};

export const getSortLabel = (sortMode) =>
  COMMENT_SORT_OPTIONS.find((option) => option.value === sortMode)?.label ||
  COMMENT_SORT_OPTIONS[0].label;

export function extractComments(payload) {
  const candidates = [
    payload?.data?.data,
    payload?.data?.comments,
    payload?.comments,
    payload?.data,
    payload,
  ];

  return candidates.find(Array.isArray) || [];
}

export function extractCommentTotal(payload, fallback = 0) {
  const candidates = [
    payload?.data?.pagination?.total,
    payload?.data?.total,
    payload?.pagination?.total,
    payload?.total,
  ];

  const value = candidates.find((item) => Number.isFinite(Number(item)));
  return value === undefined ? fallback : Number(value);
}

export function extractRootCommentTotal(payload, fallback = 0) {
  const candidates = [
    payload?.data?.rootTotal,
    payload?.rootTotal,
  ];

  const value = candidates.find((item) => Number.isFinite(Number(item)));
  return value === undefined ? fallback : Number(value);
}

export function mergeComments(currentComments = [], nextComments = [], options = {}) {
  const { prepend = false, replace = false } = options;
  const base = replace ? [] : currentComments;
  const combined = prepend ? [...nextComments, ...base] : [...base, ...nextComments];
  const seen = new Set();

  return combined.filter((comment) => {
    const id = getCommentId(comment);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function hydrateCommentAuthor(comment, user) {
  if (!comment) return comment;

  const hasAuthor =
    comment.author &&
    typeof comment.author === "object" &&
    (comment.author.fullName || comment.author.username || comment.author.avatar);

  if (hasAuthor) return comment;

  return {
    ...comment,
    author: {
      _id: user?._id || user?.id,
      fullName: user?.fullName || user?.name,
      username: user?.username,
      avatar: user?.avatar,
    },
  };
}

const asId = (value) => (value === undefined || value === null ? "" : String(value));

export function replaceCommentInTree(comments = [], updatedComment) {
  const updatedId = asId(getCommentId(updatedComment));
  if (!updatedId) return comments;

  const walk = (items) =>
    items.map((item) => {
      const currentId = asId(getCommentId(item));
      const nextReplies = Array.isArray(item.replies)
        ? walk(item.replies)
        : [];

      if (currentId !== updatedId) {
        if (!Array.isArray(item.replies)) return item;
        return { ...item, replies: nextReplies };
      }

      return {
        ...item,
        ...updatedComment,
        replies:
          Array.isArray(item.replies) && !Array.isArray(updatedComment?.replies)
            ? nextReplies
            : Array.isArray(updatedComment?.replies)
              ? updatedComment.replies
              : nextReplies,
      };
    });

  return walk(comments);
}

export function appendReplyToTree(comments = [], targetCommentId, reply) {
  const targetId = asId(targetCommentId || reply?.parentCommentId);
  if (!targetId || !reply) return comments;

  const attach = (node) => {
    const nodeId = asId(getCommentId(node));
    const replies = Array.isArray(node.replies) ? node.replies : [];

    if (nodeId === targetId) {
      return {
        node: {
          ...node,
          replies: mergeComments(replies, [reply], { prepend: false }),
        },
        attached: true,
      };
    }

    let attached = false;
    const nextReplies = replies.map((child) => {
      const result = attach(child);
      attached = attached || result.attached;
      return result.node;
    });

    if (!attached) {
      return { node, attached: false };
    }

    return {
      node: { ...node, replies: nextReplies },
      attached: true,
    };
  };

  let attachedAny = false;
  const nextComments = comments.map((comment) => {
    const result = attach(comment);
    attachedAny = attachedAny || result.attached;
    return result.node;
  });

  return attachedAny ? nextComments : comments;
}
