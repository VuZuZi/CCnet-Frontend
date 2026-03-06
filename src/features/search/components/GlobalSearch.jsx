import { Form } from 'react-bootstrap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import styles from './GlobalSearch.module.css';

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
    <div ref={boxRef} className={styles.wrap}>
      <form onSubmit={onSubmit} className={styles.form}>
        <Form.Control
          className={styles.input}
          placeholder="Search..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
        <span className={styles.icon}>⌕</span>
      </form>

      {visible ? (
        <div className={styles.dropdown} role="listbox">
          {(groups || []).map((g) => (
            <div key={g.key}>
              <div className={styles.groupLabel}>{g.label}</div>
              {(g.items || []).map((it) => {
                const letter = String(it.title || '?')
                  .trim()
                  .slice(0, 1)
                  .toUpperCase();

                return (
                  <button
                    key={`${g.key}:${it.kind}:${it.id}`}
                    type="button"
                    className={styles.itemBtn}
                    onClick={() => onPick(it)}
                  >
                    <div className={styles.avatar}>
                      {it.avatar ? (
                        <img src={it.avatar} alt={it.title} className={styles.avatarImg} />
                      ) : (
                        letter
                      )}
                    </div>
                    <div className={styles.meta}>
                      <div className={styles.title}>{it.title}</div>
                      <div className={styles.sub}>{it.subtitle}</div>
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
