import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch } from "../hooks/useGlobalSearch";

function buildSearchPath(query) {
  return `/search?q=${encodeURIComponent(String(query || "").trim())}`;
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const { query, setQuery, groups, isAuthenticated, isLoading } =
    useGlobalSearch({ debounceMs: 180, limit: 8 });

  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const hasQuery = !!String(query || "").trim();
  const visible = useMemo(() => open && hasQuery, [open, hasQuery]);

  const handlePick = (item) => {
    if (!item?.link) return;

    setOpen(false);
    setQuery("");

    navigate(item.link, {
      state: item.payload ? { data: item.payload } : {},
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmed = String(query || "").trim();
    if (!trimmed) return;

    setOpen(false);
    navigate(buildSearchPath(trimmed));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div
      ref={boxRef}
      className="relative mx-2 w-[320px] max-w-[42vw] min-w-[240px] xl:w-[350px]"
    >
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          strokeWidth={2.2}
        />

        <input
          type="text"
          className="h-10 w-full rounded-full border border-slate-200 bg-slate-50/90 pl-10 pr-10 text-sm text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100/70"
          placeholder="Search"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
        />

        <button
          type="submit"
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
        >
          <Search className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </form>

      {visible ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1200] max-h-[68vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
          role="listbox"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group.key}
                className="border-b border-slate-100 last:border-b-0"
              >
                <div className="sticky top-0 z-10 bg-white/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 backdrop-blur">
                  {group.label}
                </div>

                {(group.items || []).map((item) => {
                  const letter = String(item.title || "?")
                    .trim()
                    .slice(0, 1)
                    .toUpperCase();

                  return (
                    <button
                      key={`${group.key}:${item.kind}:${item.id}`}
                      type="button"
                      className="flex w-full items-center gap-3 border-none bg-transparent px-4 py-2.5 text-left transition-colors hover:bg-amber-50/60"
                      onClick={() => handlePick(item)}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-100 text-sm font-semibold text-slate-800">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          letter
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold leading-5 text-slate-800">
                          {item.title}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500">No results found</div>
          )}
        </div>
      ) : null}
    </div>
  );
}