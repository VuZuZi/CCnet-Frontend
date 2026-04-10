import { useQuery } from '@tanstack/react-query';
import { bankAPI } from '../api/bank.api';
import { BANK_QUERY_KEYS } from '../constants/bank.queryKeys';

export const useBankAccounts = () => {
    return useQuery({
        queryKey: BANK_QUERY_KEYS.list(),
        queryFn: bankAPI.getAccounts,
        staleTime: 1000 * 60 * 5,
    });
};