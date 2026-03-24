import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { bankAPI } from "../api/bankAPI";

export function useVietnamBanks() {
  const query = useQuery({
    queryKey: ["vietqr-banks"],
    queryFn: bankAPI.getVietnamBanks,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const banks = useMemo(() => {
    const raw = Array.isArray(query.data) ? query.data : [];

    return raw.map((bank) => ({
      id: bank.id,
      name: bank.name,
      shortName: bank.shortName,
      code: bank.code,
      bin: bank.bin,
      logo: bank.logo,
      displayLabel: `${bank.shortName || bank.code} - ${bank.name}`,
    }));
  }, [query.data]);

  return {
    banks,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export default useVietnamBanks;