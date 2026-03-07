import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

function buildPersonPath(id) {
  return `/users/${String(id)}`;
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const { query, setQuery, groups, isAuthenticated } = useGlobalSearch({ debounceMs: 180, limit: 8 });

  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const visible = useMemo(() => {
    return open && !!String(query || '').trim() && (groups || []).length > 0;
  }, [open, query, groups]);

  const firstItem = useMemo(() => {
    const g0 = (groups || [])[0];
    return g0?.items?.[0] || null;
  }, [groups]);

  const onPick = (item) => {
    if (!item) return;

    if (item.kind === 'person') {
      setOpen(false);
      setQuery('');
      navigate(buildPersonPath(item.id), { state: { user: item.payload } });
      return;
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!firstItem) return;
    onPick(firstItem);
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!isAuthenticated) return null;

  return (
    // wrap
    <div ref={boxRef} className="relative w-[360px] max-w-[46vw] mx-[14px]">
      {/* form */}
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          className="w-full rounded-full pl-[14px] pr-[36px] py-2 border border-light-gray bg-white text-black focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow transition-colors"
          placeholder="Search..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
        {/* icon */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-60 pointer-events-none">
          ⌕
        </span>
      </form>

      {visible ? (
        // dropdown
        <div 
          className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-light-gray rounded-xl shadow-sm overflow-hidden z-[1200]" 
          role="listbox"
        >
          {(groups || []).map((g) => (
            <div key={g.key}>
              {/* groupLabel */}
              <div className="px-3 py-2 text-xs font-bold opacity-75 bg-light-gray">
                {g.label}
              </div>
              {(g.items || []).map((it) => {
                const letter = String(it.title || '?')
                  .trim()
                  .slice(0, 1)
                  .toUpperCase();

                return (
                  // itemBtn
                  <button
                    key={`${g.key}:${it.kind}:${it.id}`}
                    type="button"
                    className="w-full text-left bg-transparent border-none py-2.5 px-3 flex gap-2.5 items-center hover:bg-light-gray cursor-pointer transition-colors"
                    onClick={() => onPick(it)}
                  >
                    {/* avatar */}
                    <div className="w-9 h-9 rounded-full bg-yellow text-black flex items-center justify-center font-bold overflow-hidden shrink-0">
                      {it.avatar ? (
                        <img src={it.avatar} alt={it.title} className="w-full h-full object-cover" />
                      ) : (
                        letter
                      )}
                    </div>
                    {/* meta */}
                    <div className="min-w-0 flex-1">
                      {/* title */}
                      <div className="font-semibold leading-tight truncate text-black">{it.title}</div>
                      {/* sub */}
                      <div className="text-xs opacity-70 truncate text-black">{it.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}