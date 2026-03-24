import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';

const INITIAL_FILTERS = {
  search: '',
  category: '',
  urgencyLevel: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useHelpRequestFilters = () => {
  const [localSearch, setLocalSearch] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setLocalSearch('');
  }, []);

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.category ||
    filters.urgencyLevel
  );

  return {
    filters,
    localSearch,
    setLocalSearch,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  };
};

export const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'Y_TE', label: 'Medical Aid' },
  { value: 'GIAO_DUC', label: 'Education' },
  { value: 'THIEN_TAI', label: 'Disaster Relief' },
  { value: 'XAY_DUNG', label: 'Construction' },
  { value: 'MOI_TRUONG', label: 'Environment' },
  { value: 'KHAC', label: 'Other' },
];

export const URGENCY_OPTIONS = [
  { value: '', label: 'All Urgency Levels' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

