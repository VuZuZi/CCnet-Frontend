import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { adminAPI } from "../api/adminAPI";

const PAGE_SIZE = 20;

function getRoleBadgeClasses(role) {
  const normalized = String(role || "").toLowerCase();

  if (normalized === "admin") {
    return "bg-violet-50 text-violet-700 border border-violet-200";
  }

  if (normalized === "organizer") {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }

  return "bg-slate-50 text-slate-600 border border-slate-200";
}

function normalizeUsersResponse(response) {
  const payload = response?.data?.data;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: null,
    };
  }

  return {
    items: payload?.items || [],
    pagination: payload?.pagination || null,
  };
}

export default function UserMultiSelect({
  value = [],
  onChange,
  placeholder = "Search and select users...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  const rootRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);

  const selectedIds = useMemo(
    () => new Set(value.map((user) => String(user._id))),
    [value]
  );

  const fetchUsers = async ({ nextPage = 1, search = "", replace = false } = {}) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const response = await adminAPI.getUsers({
        search,
        page: nextPage,
        limit: PAGE_SIZE,
      });

      const { items, pagination } = normalizeUsersResponse(response);

      setUsers((prev) => {
        if (replace) return items;

        const existingIds = new Set(prev.map((item) => String(item._id)));
        const merged = [...prev];

        for (const item of items) {
          if (!existingIds.has(String(item._id))) {
            merged.push(item);
          }
        }

        return merged;
      });

      if (pagination) {
        setHasMore(pagination.page < pagination.totalPages);
      } else {
        setHasMore(items.length === PAGE_SIZE);
      }

      setPage(nextPage);
      setIsInitialLoaded(true);
    } catch (error) {
      console.error("[UserMultiSelect] Failed to fetch users:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchUsers({
        nextPage: 1,
        search: keyword.trim(),
        replace: true,
      });
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [keyword, isOpen]);

  useEffect(() => {
    if (isOpen && !isInitialLoaded) {
      fetchUsers({
        nextPage: 1,
        search: "",
        replace: true,
      });
    }
  }, [isOpen, isInitialLoaded]);

  const toggleUser = (user) => {
    const id = String(user._id);
    const exists = selectedIds.has(id);

    if (exists) {
      onChange(value.filter((item) => String(item._id) !== id));
      return;
    }

    onChange([...value, user]);
  };

  const removeUser = (userId) => {
    onChange(value.filter((item) => String(item._id) !== String(userId)));
  };

  const handleScroll = () => {
    if (!listRef.current || isLoading || !hasMore) return;

    const { scrollTop, clientHeight, scrollHeight } = listRef.current;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 40;

    if (nearBottom) {
      fetchUsers({
        nextPage: page + 1,
        search: keyword.trim(),
        replace: false,
      });
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Specific users
      </label>

      <div className="relative" ref={rootRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex min-h-[56px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {value.length > 0 ? (
              value.map((user) => (
                <span
                  key={user._id}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                >
                  <img
                    src={
                      user.avatar ||
                      "https://www.gravatar.com/avatar/?d=identicon"
                    }
                    alt={user.fullName || "User avatar"}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span className="max-w-[120px] truncate">
                    {user.fullName || user.email || "Unknown user"}
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUser(user._id);
                    }}
                    className="cursor-pointer text-amber-600 transition hover:text-amber-800"
                  >
                    <X size={12} />
                  </span>
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">{placeholder}</span>
            )}
          </div>

          <ChevronDown
            size={18}
            className={`ml-3 shrink-0 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-3 right-3 top-[calc(100%+16px)] z-30 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
            <div className="border-b border-slate-100 bg-white/95 p-3 backdrop-blur-sm">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            <div
              ref={listRef}
              onScroll={handleScroll}
              className="max-h-72 overflow-y-auto px-3 pb-3 pt-3"
            >
              {users.length === 0 && !isLoading ? (
                <div className="rounded-xl px-3 py-8 text-center text-sm text-slate-400">
                  No users found.
                </div>
              ) : (
                users.map((user) => {
                  const isSelected = selectedIds.has(String(user._id));

                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleUser(user)}
                      className={`mb-2 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-all duration-150 ${
                        isSelected
                          ? "bg-amber-50 ring-1 ring-amber-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={
                            user.avatar ||
                            "https://www.gravatar.com/avatar/?d=identicon"
                          }
                          alt={user.fullName || "User avatar"}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                        />

                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-800">
                            {user.fullName || "Unnamed user"}
                          </div>
                          <div className="truncate text-xs text-slate-400">
                            {user.email || "No email"}
                          </div>
                        </div>
                      </div>

                      <div className="ml-3 flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getRoleBadgeClasses(
                            user.role
                          )}`}
                        >
                          {user.role || "user"}
                        </span>

                        {isSelected ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                            <Check size={14} />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}

              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  Loading users...
                </div>
              ) : null}

              {!isLoading && hasMore && users.length > 0 ? (
                <div className="px-2 pb-1 pt-2 text-center text-xs text-slate-400">
                  Scroll to load more
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}