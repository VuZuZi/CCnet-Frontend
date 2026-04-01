import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useGlobalSearch } from "../hooks/useGlobalSearch";

function buildSearchPath(query) {
  return `/search?q=${encodeURIComponent(String(query || "").trim())}`;
}

export default function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { query, setQuery, groups, isAuthenticated, isLoading } =
    useGlobalSearch({ debounceMs: 180, limit: 8 });

  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const hasQuery = !!String(query || "").trim();
  const visible = useMemo(() => open && hasQuery, [open, hasQuery]);

  const onPick = (item) => {
    if (!item) return;

    setOpen(false);
    setQuery("");

    if (item.link) {
      navigate(item.link, { state: item.payload ? { data: item.payload } : {} });
      return;
    }

    navigate(buildSearchPath(item.title || query));
  };

  const onSubmit = (e) => {
    e.preventDefault();

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
    <div ref={boxRef} className="relative mx-[14px] w-[420px] max-w-[50vw]">
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          className="w-full rounded-full border border-amber-300 bg-white/95 py-3 pl-5 pr-11 text-[17px] text-slate-900 shadow-sm transition-all duration-300 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100"
          placeholder={`${t('common.search')}...`}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />

        <button
          type="submit"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-sm text-slate-500 transition-all duration-200 hover:bg-amber-50 hover:text-amber-600"
        >
          ⌕
        </button>
      </form>

      {visible ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+10px)] z-[1200] max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"
          role="listbox"
        >
          {isLoading ? (
            <div className="px-4 py-4 text-sm text-slate-600">{t('common.loading')}</div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.key} className="border-b border-slate-100 last:border-b-0">
                <div className="sticky top-0 z-10 bg-slate-50/90 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 backdrop-blur">
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
                      className="flex w-full items-center gap-3 border-none bg-transparent px-4 py-3 text-left transition-all duration-200 hover:bg-amber-50/70 hover:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.14)]"
                      onClick={() => onPick(item)}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-200 font-bold text-slate-900 shadow-sm">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          letter
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[17px] font-semibold leading-tight text-slate-900">
                          {item.title}
                        </div>
                        <div className="mt-0.5 truncate text-sm text-slate-500">
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-slate-600">No results found</div>
          )}
        </div>
      ) : null}
    </div>
  );
}