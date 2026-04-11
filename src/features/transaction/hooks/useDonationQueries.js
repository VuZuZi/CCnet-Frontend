import { useQuery } from '@tanstack/react-query';
import { transactionAPI } from '../api/transaction.api';
import { TRANSACTION_QUERY_KEYS } from '../constants/transaction.queryKeys';

export const useMyDonations = (params) => {
    return useQuery({
        queryKey: TRANSACTION_QUERY_KEYS.myDonations(params), 
        queryFn: () => transactionAPI.getMyDonations(params),
        staleTime: 1000 * 60 * 5,
    });
};