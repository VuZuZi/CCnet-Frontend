export const SEARCH_GROUP_ORDER = [
  "user",
  "organizer",
  "project",
  "needhelp",
  "communitypost",
];

export const SEARCH_GROUP_LABELS = {
  user: "Người dùng",
  organizer: "Nhà tổ chức",
  project: "Dự án",
  needhelp: "Yêu cầu hỗ trợ",
  communitypost: "Bài viết cộng đồng",
};

function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function isUsableItem(item = {}) {
  return Boolean(
    item?.id &&
      item?.kind &&
      normalizeString(item.link) &&
      normalizeString(item.title)
  );
}

export function normalizeSearchItem(item = {}) {
  if (!isUsableItem(item)) return null;

  return {
    id: String(item.id),
    kind: String(item.kind),
    title: normalizeString(item.title),
    subtitle: normalizeString(item.subtitle),
    avatar: normalizeString(item.avatar),
    link: normalizeString(item.link),
    payload:
      item.payload && typeof item.payload === "object" ? item.payload : {},
  };
}

export function buildSearchGroups(groups = {}) {
  return SEARCH_GROUP_ORDER.map((key) => {
    const rawItems = Array.isArray(groups[key]) ? groups[key] : [];
    const items = rawItems.map(normalizeSearchItem).filter(Boolean);

    if (!items.length) return null;

    return {
      key,
      label: SEARCH_GROUP_LABELS[key],
      items,
    };
  }).filter(Boolean);
}
