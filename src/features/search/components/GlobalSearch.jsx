import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

function buildPersonPath(id) {
  return `/users/${String(id)}`;
}

function buildProjectPath(id) {
  return `/projects/${String(id)}`;
}

export default function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    groups,
    isAuthenticated,
    isLoading,
  } = useGlobalSearch({ debounceMs: 180, limit: 8 });

  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const hasQuery = !!String(query || '').trim();

  const visible = useMemo(() => {
    return open && hasQuery;
  }, [open, hasQuery]);

  const firstItem = useMemo(() => {
    const firstGroup = (groups || [])[0];
    return firstGroup?.items?.[0] || null;
  }, [groups]);

  const onPick = (item) => {
    if (!item) return;

    setOpen(false);
    setQuery('');

    if (item.kind === 'person') {
      navigate(buildPersonPath(item.id), { state: { user: item.payload } });
      return;
    }

    if (item.kind === 'project') {
      navigate(buildProjectPath(item.id), { state: { project: item.payload } });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!firstItem) return;
    onPick(firstItem);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div ref={boxRef} className="relative mx-[14px] w-[360px] max-w-[46vw]">
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          className="w-full rounded-full border border-light-gray bg-white py-2 pl-[14px] pr-[36px] text-black transition-colors focus:border-yellow focus:outline-none focus:ring-1 focus:ring-yellow"
          placeholder={`${t('common.search')}...`}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-60">
          ⌕
        </span>
      </form>

      {visible ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1200] overflow-hidden rounded-xl border border-light-gray bg-white shadow-sm"
          role="listbox"
        >
          {isLoading ? (
            <div className="px-3 py-3 text-sm text-black/70">{t('common.loading')}</div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.key}>
                <div className="bg-light-gray px-3 py-2 text-xs font-bold opacity-75">
                  {group.label}
                </div>

                {(group.items || []).map((item) => {
                  const letter = String(item.title || '?')
                    .trim()
                    .slice(0, 1)
                    .toUpperCase();

                  return (
                    <button
                      key={`${group.key}:${item.kind}:${item.id}`}
                      type="button"
                      className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3 py-2.5 text-left transition-colors hover:bg-light-gray"
                      onClick={() => onPick(item)}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-yellow font-bold text-black">
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
                        <div className="truncate font-semibold leading-tight text-black">
                          {item.title}
                        </div>
                        <div className="truncate text-xs text-black opacity-70">
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-black/70">No results found</div>
          )}
        </div>
      ) : null}
    </div>
  );
}