import { useInfiniteQuery } from '@tanstack/react-query';
import { chatAPI } from '@/features/chat/api/chat.api';
import { CHAT_ASSET_PAGE_LIMIT } from '@/features/chat/constants/chat.constants';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';

function getNextPageParam(lastPage) {
  if (!lastPage?.hasMore) return undefined;
  return lastPage?.nextPage || undefined;
}

function flattenAssetPages(data) {
  const pages = Array.isArray(data?.pages) ? data.pages : [];
  return pages.flatMap((page) => (Array.isArray(page?.items) ? page.items : []));
}

function getDefaultAssetPage() {
  return {
    items: [],
    page: 1,
    limit: CHAT_ASSET_PAGE_LIMIT,
    hasMore: false,
    nextPage: null,
  };
}

function useConversationAssets(conversationId, type, enabled = true) {
  const cid = String(conversationId || '');

  const query = useInfiniteQuery({
    queryKey: chatKeys.assets(cid, type),
    enabled: Boolean(cid && type && enabled),
    staleTime: 10_000,
    refetchOnWindowFocus: false,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const data = await chatAPI.getConversationAssets(cid, type, {
        page: pageParam,
        limit: CHAT_ASSET_PAGE_LIMIT,
      });

      return data && typeof data === 'object' ? data : getDefaultAssetPage();
    },
    getNextPageParam,
  });

  return {
    ...query,
    data: flattenAssetPages(query.data),
    rawPages: query.data?.pages || [],
    hasMore: Boolean(query.hasNextPage),
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}

export { useConversationAssets };
export default useConversationAssets;