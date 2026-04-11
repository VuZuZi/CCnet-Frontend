import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { transactionAPI } from '../api/transaction.api';
import { TRANSACTION_QUERY_KEYS } from '../constants/transaction.queryKeys';
import { globalEventBus, APP_EVENTS } from '@/shared/lib/eventBus';

export const useInfiniteProjectDonors = (projectId) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!projectId) return;

        const handleUpdate = (event) => {
            if (event.detail?.projectId === String(projectId)) {
                queryClient.invalidateQueries({
                    queryKey: TRANSACTION_QUERY_KEYS.projectDonors(projectId)
                });
            }
        };

        globalEventBus.addEventListener(APP_EVENTS.DONATION_SUCCESS, handleUpdate);
        globalEventBus.addEventListener(APP_EVENTS.REFUND_SUCCESS, handleUpdate);

        return () => {
            globalEventBus.removeEventListener(APP_EVENTS.DONATION_SUCCESS, handleUpdate);
            globalEventBus.removeEventListener(APP_EVENTS.REFUND_SUCCESS, handleUpdate);
        };
    }, [projectId, queryClient]);

    return useInfiniteQuery({
        queryKey: TRANSACTION_QUERY_KEYS.projectDonors(projectId, { limit: 10 }),
        queryFn: ({ pageParam = 1 }) =>
            transactionAPI.getProjectDonors(projectId, { page: pageParam, limit: 10 }),
        getNextPageParam: (lastPage) => {
            if (!lastPage?.pagination) return undefined;
            const { currentPage, totalPages } = lastPage.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 2,
        enabled: !!projectId,
    });
};