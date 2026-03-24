import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizerRequestAdminAPI } from '../api/organizerRequestAdminAPI';

export function useOrganizerRequests() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10,
  });

  const query = useQuery({
    queryKey: ['admin', 'organizer-requests', filters],
    queryFn: () => organizerRequestAdminAPI.getRequests(filters),
    keepPreviousData: true,
  });

  const items = useMemo(() => query.data?.items || [], [query.data]);
  const pagination = useMemo(
    () =>
      query.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    [query.data]
  );

  return {
    filters,
    setFilters,
    items,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}