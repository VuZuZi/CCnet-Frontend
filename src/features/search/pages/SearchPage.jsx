import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import SearchSidebar from "../components/SearchSidebar";
import SearchResults from "../components/SearchResults";
import { searchAPI } from "../api/searchAPI";
import { normalizeSearchItem } from "../utils/search.normalize";
import { searchKeys } from "../utils/search.queryKeys";
import {
  buildLocationOptions,
  buildSearchParams,
  parseBooleanParam,
} from "../utils/search.utils";

const PAGE_BATCH_SIZE = 8;

const DEFAULT_POST_FILTERS = {
  recentOnly: false,
  viewedOnly: false,
  dateOrder: "newest",
  location: "",
};

const EMPTY_COUNTS = {
  all: 0,
  organizer: 0,
  project: 0,
  needhelp: 0,
  communitypost: 0,
  user: 0,
};

function shouldEnablePostFilters(type) {
  return type === "all" || type === "communitypost";
}

function buildNextParams(searchParams, nextValues = {}) {
  return buildSearchParams(searchParams, nextValues);
}

function getErrorMessage(error) {
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  const apiMessage = error?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  return "Đã có lỗi xảy ra khi tải kết quả tìm kiếm.";
}

export default function SearchPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const loadMoreRef = useRef(null);

  const query = String(searchParams.get("q") || "").trim();
  const type = String(searchParams.get("type") || "all").trim().toLowerCase();

  const filters = useMemo(
    () => ({
      recentOnly: parseBooleanParam(
        searchParams.get("recentOnly"),
        DEFAULT_POST_FILTERS.recentOnly
      ),
      viewedOnly: parseBooleanParam(
        searchParams.get("viewedOnly"),
        DEFAULT_POST_FILTERS.viewedOnly
      ),
      dateOrder:
        String(searchParams.get("dateOrder") || DEFAULT_POST_FILTERS.dateOrder)
          .trim()
          .toLowerCase() || "newest",
      location: String(searchParams.get("location") || "").trim(),
    }),
    [searchParams]
  );

  const postFiltersEnabled = shouldEnablePostFilters(type);

  const queryKey = useMemo(
    () =>
      searchKeys.page({
        query,
        type,
        limit: PAGE_BATCH_SIZE,
        filters,
      }),
    [query, type, filters]
  );

  const searchQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) =>
      searchAPI.searchPage({
        q: query,
        type,
        limit: PAGE_BATCH_SIZE,
        offset: pageParam,
        recentOnly: filters.recentOnly,
        viewedOnly: filters.viewedOnly,
        dateOrder: filters.dateOrder,
        location: filters.location,
        includeCounts: pageParam === 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage?.batch?.hasMore ? lastPage.batch.nextOffset : undefined,
    enabled: Boolean(query),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = searchQuery;

  const markViewedMutation = useMutation({
    mutationFn: (postId) => searchAPI.markCommunityPostViewed(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey,
        exact: true,
      });
    },
  });

  const pages = Array.isArray(data?.pages) ? data.pages : [];
  const firstPage = pages[0] || null;
  const counts = firstPage?.counts ?? EMPTY_COUNTS;

  const results = useMemo(() => {
    return pages
      .flatMap((page) => (Array.isArray(page?.results) ? page.results : []))
      .map(normalizeSearchItem)
      .filter(Boolean);
  }, [pages]);

  const locationOptions = useMemo(() => buildLocationOptions(results), [results]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (isFetchingNextPage) return;

        fetchNextPage();
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleTypeChange = (nextType) => {
    const nextParams = { type: nextType };

    if (!shouldEnablePostFilters(nextType)) {
      nextParams.recentOnly = false;
      nextParams.viewedOnly = false;
      nextParams.dateOrder = undefined;
      nextParams.location = "";
    }

    setSearchParams(buildNextParams(searchParams, nextParams));
  };

  const handleFilterChange = (patch = {}) => {
    if (!postFiltersEnabled) return;
    setSearchParams(buildNextParams(searchParams, patch));
  };

  const handleOpenItem = (item) => {
    if (!item?.link) return;

    if (item.kind === "communitypost" && item.id) {
      markViewedMutation.mutate(item.id);
    }

    navigate(item.link, {
      state: item.payload ? { data: item.payload } : {},
    });
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SearchSidebar
          activeType={type}
          counts={counts}
          onChange={handleTypeChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          locationOptions={locationOptions}
          postFiltersEnabled={postFiltersEnabled}
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

          {isError ? (
            <div className="rounded-[26px] border border-rose-200 bg-white p-6 text-sm text-rose-600 shadow-sm">
              {getErrorMessage(error)}
            </div>
          ) : (
            <>
              <SearchResults
                results={results}
                loading={isLoading}
                query={query}
                onOpen={handleOpenItem}
              />

              {hasNextPage ? (
                <div
                  ref={loadMoreRef}
                  className="py-6 text-center text-sm text-slate-500"
                >
                  {isFetchingNextPage
                    ? "Đang tải thêm..."
                    : "Kéo xuống để tải thêm"}
                </div>
              ) : results.length > 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">
                  Đã hiển thị hết kết quả hiện có.
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}