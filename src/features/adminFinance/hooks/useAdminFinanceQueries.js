import { useQuery } from '@tanstack/react-query';
import { adminFinanceAPI } from '../api/adminFinance.api';
import { ADMIN_FINANCE_QUERY_KEYS } from '../constants/adminFinance.queryKeys';

export const useAdminFinanceSummary = (filters = {}) => {
    return useQuery({
        queryKey: ADMIN_FINANCE_QUERY_KEYS.summary(filters),
        queryFn: () => adminFinanceAPI.getSummary(filters),
        staleTime: 60 * 1000,
        retry: false,
    });
};

export const useAdminFinanceDetail = (projectId) => {
    return useQuery({
        queryKey: ADMIN_FINANCE_QUERY_KEYS.detail(projectId),
        queryFn: () => adminFinanceAPI.getDetail(projectId),
        enabled: Boolean(projectId),
        staleTime: 0,
        retry: false,
    });
};