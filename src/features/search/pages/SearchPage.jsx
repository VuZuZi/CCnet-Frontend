import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SearchSidebar from "../components/SearchSidebar";
import SearchResults from "../components/SearchResults";
import { searchAPI } from "../api/searchAPI";

const VIEWED_POSTS_STORAGE_KEY = "ccnet.search.viewedCommunityPosts";

const DEFAULT_POST_FILTERS = {
  recentOnly: false,
  viewedOnly: false,
  dateOrder: "newest",
  location: "",
};

function buildSearchParams(searchParams, nextValues = {}) {
  const params = new URLSearchParams(searchParams);

  Object.entries(nextValues).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
      return;
    }

    params.set(key, String(value));
  });

  return params;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function readViewedPostIds() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(VIEWED_POSTS_STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeViewedPostIds(ids = []) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      VIEWED_POSTS_STORAGE_KEY,
      JSON.stringify(Array.from(new Set(ids)))
    );
  } catch {
    // ignore
  }
}

function markPostAsViewed(postId) {
  const current = readViewedPostIds();
  const next = Array.from(new Set([...current, String(postId)]));
  writeViewedPostIds(next);
  return next;
}

function getPostLocation(item) {
  return String(
    item?.payload?.taggedLocation ||
      item?.payload?.location?.address ||
      item?.payload?.address ||
      ""
  ).trim();
}

function getPostCreatedAt(item) {
  return item?.payload?.createdAt || null;
}

function isRecentPost(item, days = 7) {
  const createdAt = getPostCreatedAt(item);
  if (!createdAt) return false;

  const time = new Date(createdAt).getTime();
  if (Number.isNaN(time)) return false;

  const now = Date.now();
  const diff = now - time;
  const max = days * 24 * 60 * 60 * 1000;

  return diff >= 0 && diff <= max;
}

function sortPostsByDate(items = [], order = "newest") {
  const cloned = [...items];

  cloned.sort((a, b) => {
    const aTime = new Date(getPostCreatedAt(a) || 0).getTime();
    const bTime = new Date(getPostCreatedAt(b) || 0).getTime();

    if (order === "oldest") return aTime - bTime;
    return bTime - aTime;
  });

  return cloned;
}

function orderByPriority(items = []) {
  const priority = ["organizer", "project", "needhelp", "communitypost"];

  return priority.flatMap((kind) =>
    items.filter((item) => String(item?.kind || "") === kind)
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [postFilters, setPostFilters] = useState(DEFAULT_POST_FILTERS);
  const [viewedPostIds, setViewedPostIds] = useState(() => readViewedPostIds());

  const query = String(searchParams.get("q") || "").trim();
  const type = String(searchParams.get("type") || "all").trim().toLowerCase();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);

  const searchQuery = useQuery({
    queryKey: ["search", "page", query, type, page, limit],
    queryFn: () =>
      searchAPI.searchPage({
        q: query,
        type,
        page,
        limit,
      }),
    enabled: !!query,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  const data = searchQuery.data || {};
  const counts = data.counts || {};

  const rawResults = useMemo(() => {
    if (Array.isArray(data.results)) return data.results;

    if (type !== "all" && Array.isArray(data?.groups?.[type])) {
      return data.groups[type];
    }

    if (type === "all" && data.groups) {
      return [
        ...(Array.isArray(data.groups.organizer) ? data.groups.organizer : []),
        ...(Array.isArray(data.groups.project) ? data.groups.project : []),
        ...(Array.isArray(data.groups.needhelp) ? data.groups.needhelp : []),
        ...(Array.isArray(data.groups.communitypost)
          ? data.groups.communitypost
          : []),
      ];
    }

    return [];
  }, [data, type]);

  const locationOptions = useMemo(() => {
    const locations = Array.from(
      new Set(
        rawResults
          .filter((item) => item.kind === "communitypost")
          .map((item) => getPostLocation(item))
          .filter(Boolean)
      )
    );

    return locations.map((location) => ({
      value: location,
      label: location,
    }));
  }, [rawResults]);

  const results = useMemo(() => {
    if (!["all", "communitypost"].includes(type)) {
      return rawResults;
    }

    const viewedSet = new Set(viewedPostIds.map((id) => String(id)));
    const posts = rawResults.filter((item) => item.kind === "communitypost");
    const nonPosts = rawResults.filter((item) => item.kind !== "communitypost");

    let filteredPosts = [...posts];

    if (postFilters.recentOnly) {
      filteredPosts = filteredPosts.filter((item) => isRecentPost(item, 7));
    }

    if (postFilters.viewedOnly) {
      filteredPosts = filteredPosts.filter((item) =>
        viewedSet.has(String(item.id))
      );
    }

    if (postFilters.location) {
      const locationNeedle = normalizeText(postFilters.location);
      filteredPosts = filteredPosts.filter(
        (item) => normalizeText(getPostLocation(item)) === locationNeedle
      );
    }

    filteredPosts = sortPostsByDate(
      filteredPosts,
      postFilters.dateOrder || "newest"
    );

    if (type === "communitypost") {
      return filteredPosts;
    }

    return orderByPriority([...nonPosts, ...filteredPosts]);
  }, [rawResults, type, postFilters, viewedPostIds]);

  const handleTypeChange = (nextType) => {
    setSearchParams(
      buildSearchParams(searchParams, {
        type: nextType,
        page: 1,
      })
    );
  };

  const handleFilterChange = (patch = {}) => {
    setPostFilters((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const handleOpenItem = (item) => {
    if (!item) return;

    if (item.kind === "communitypost" && item.id) {
      const nextViewedIds = markPostAsViewed(item.id);
      setViewedPostIds(nextViewedIds);
    }

    if (item.link) {
      navigate(item.link, {
        state: item.payload ? { data: item.payload } : {},
      });
      return;
    }

    if (item.kind === "user" || item.kind === "organizer") {
      navigate(`/users/${String(item.id)}`);
      return;
    }

    if (item.kind === "project") {
      navigate(`/projects/${String(item.id)}`);
      return;
    }

    if (item.kind === "needhelp") {
      navigate(`/need-help/${String(item.id)}`);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SearchSidebar
          activeType={type}
          counts={counts}
          onChange={handleTypeChange}
          filters={postFilters}
          onFilterChange={handleFilterChange}
          locationOptions={locationOptions}
          postFiltersEnabled={type === "all" || type === "communitypost"}
        />

        <div className="min-w-0">
          <div className="mb-4 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">
              Kết quả tìm kiếm
            </h1>

            <p className="mt-2 text-[15px] text-slate-500">
              Từ khóa:{" "}
              <span className="font-bold text-slate-800">{query || "..."}</span>
            </p>
          </div>

          <SearchResults
            results={results}
            loading={searchQuery.isLoading || searchQuery.isFetching}
            query={query}
            onOpen={handleOpenItem}
          />
        </div>
      </div>
    </section>
  );
}