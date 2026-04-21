import { useQuery } from '@tanstack/react-query';
import { disbursementAPI } from '../api/disbursement.api';
import { DISBURSEMENT_QUERY_KEYS } from '../constants/disbursement.queryKeys';

export const useMyDisbursementRequests = (filters = {}) => {
    return useQuery({
        queryKey: DISBURSEMENT_QUERY_KEYS.list(filters),
        queryFn: () => disbursementAPI.getMyRequests(filters),
    });
};

export const useDisbursementDetail = (id) => {
    return useQuery({
        queryKey: DISBURSEMENT_QUERY_KEYS.detail(id),
        queryFn: () => disbursementAPI.getRequestDetail(id),
        enabled: Boolean(id),
    });
};

export const useAdminDisbursementList = (filters = {}) => {
    return useQuery({
        queryKey: [...DISBURSEMENT_QUERY_KEYS.all, 'admin-list', filters],
        queryFn: () => disbursementAPI.getAdminDisbursementList(filters),
        staleTime: 30000,
    });
};