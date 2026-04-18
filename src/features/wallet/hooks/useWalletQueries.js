import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { walletAPI } from '../api/wallet.api';
import { WALLET_QUERY_KEYS } from '../constants/wallet.queryKeys';

export const useMyWallet = (options = {}) => {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.me(),
        queryFn: walletAPI.getMe,
        staleTime: 1000 * 60 * 2,
        enabled: options.enabled ?? true,
    });
};

export const useWalletHistory = () => {
    return useInfiniteQuery({
        queryKey: WALLET_QUERY_KEYS.history({ limit: 10 }),
        queryFn: ({ pageParam = 1 }) => walletAPI.getHistory({ page: pageParam, limit: 10 }),
        getNextPageParam: (lastPage) => {
            if (!lastPage?.pagination) return undefined;
            const { currentPage, totalPages } = lastPage.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        initialPageParam: 1,
    });
};