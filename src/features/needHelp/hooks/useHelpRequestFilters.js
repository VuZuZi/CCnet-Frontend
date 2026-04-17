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
  { value: '', label: 'Tất cả danh mục' },
  { value: 'Y_TE', label: 'Hỗ trợ y tế' },
  { value: 'GIAO_DUC', label: 'Giáo dục' },
  { value: 'THIEN_TAI', label: 'Cứu trợ thiên tai' },
  { value: 'XAY_DUNG', label: 'Xây dựng' },
  { value: 'MOI_TRUONG', label: 'Môi trường' },
  { value: 'KHAC', label: 'Khác' },
];

export const URGENCY_OPTIONS = [
  { value: '', label: 'Tất cả mức độ khẩn cấp' },
  { value: 'CRITICAL', label: 'Khẩn cấp' },
  { value: 'HIGH', label: 'Cao' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'LOW', label: 'Thấp' },
];

