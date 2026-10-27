import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PagedResult } from "@/models/App.types";

type Options<T> = {
  /** Cache key; include every filter so a new filter starts again from page 1. */
  queryKey: readonly unknown[];
  fetchPage: (page: number) => Promise<PagedResult<T>>;
  enabled?: boolean;
};

/**
 * A list read page by page from the API (infinite scroll). `items` holds every page loaded so
 * far; call `loadMore` from FlatList's onEndReached. `totalCount` is the API's total for the filters.
 */
export function usePagedList<T>({ queryKey, fetchPage, enabled = true }: Options<T>) {
  const query = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const totalCount = query.data?.pages[0]?.totalCount ?? 0;

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ...query, items, totalCount, loadMore };
}
