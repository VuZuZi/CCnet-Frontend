export const searchKeys = {
  all: ["search"],

  navbar: ({ query, limit }) => [
    "search",
    "navbar",
    String(query || "").trim(),
    Number(limit || 8),
  ],

  page: ({ query, type, limit, filters = {} }) => [
    "search",
    "page",
    String(query || "").trim(),
    String(type || "all").trim().toLowerCase(),
    Number(limit || 8),
    Boolean(filters.recentOnly),
    Boolean(filters.viewedOnly),
    String(filters.dateOrder || "newest").trim().toLowerCase(),
    String(filters.location || "").trim(),
  ],
};

export default searchKeys;