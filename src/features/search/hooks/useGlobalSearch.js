import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { searchAPI } from '../api/searchAPI';

export function useGlobalSearch({ debounceMs = 180, limit = 8 } = {}) {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const user = useAuthStore(authSelectors.user);
  const meId = user?.userId || user?._id || user?.id;

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(String(query || '').trim()), debounceMs);
    return () => clearTimeout(t);
  }, [query, debounceMs]);

  const enabled = isAuthenticated && debounced.length > 0;

  const q = useQuery({
    queryKey: ['search', 'global', debounced, limit],
    queryFn: () => searchAPI.globalSearch({ q: debounced, limit }),
    enabled,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  const groups = useMemo(() => {
    const data = q.data || {};
    const usersRaw = Array.isArray(data.users) ? data.users : [];
    const users = meId ? usersRaw.filter((u) => String(u.id) !== String(meId)) : usersRaw;

    const projects = Array.isArray(data.projects) ? data.projects : [];
    const orgs = Array.isArray(data.orgs) ? data.orgs : [];

    const g = [];

    if (users.length) {
      g.push({
        key: 'people',
        label: 'People',
        items: users.map((u) => ({
          kind: 'person',
          id: u.id,
          title: u.fullName || u.email || 'Unknown',
          subtitle: u.email || '',
          avatar: u.avatar || '',
          payload: u,
        })),
      });
    }

    if (projects.length) {
      g.push({
        key: 'projects',
        label: 'Projects',
        items: projects.map((p) => ({
          kind: 'project',
          id: p.id,
          title: p.name || 'Project',
          subtitle: p.code || '',
          avatar: '',
          payload: p,
        })),
      });
    }

    if (orgs.length) {
      g.push({
        key: 'orgs',
        label: 'Organizations',
        items: orgs.map((o) => ({
          kind: 'org',
          id: o.id,
          title: o.name || 'Organization',
          subtitle: '',
          avatar: '',
          payload: o,
        })),
      });
    }

    return g;
  }, [q.data, meId]);

  return {
    query,
    setQuery,
    groups,
    isAuthenticated,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
  };
}
