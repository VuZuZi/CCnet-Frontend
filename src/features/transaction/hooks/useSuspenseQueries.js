import { useQuery } from '@tanstack/react-query';
import { suspenseAPI } from '../api/suspense.api';
import { SUSPENSE_QUERY_KEYS } from '../constants/suspense.queryKeys';

export const useSuspenseList = (params) => {
    return useQuery({
        queryKey: SUSPENSE_QUERY_KEYS.list(params),
        queryFn: () => suspenseAPI.getSuspenseList(params),
        staleTime: 1000 * 60 * 2,
    });
};