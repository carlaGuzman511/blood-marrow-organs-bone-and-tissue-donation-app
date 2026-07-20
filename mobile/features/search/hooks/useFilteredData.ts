import { useMemo } from "react";
import { SearchFilters } from "../types/Search.types";

interface Props<T> {
    data: T[];
    filters: SearchFilters;
    predicate: (
        item: T,
        filters: SearchFilters
    ) => boolean;
}

export function useFilteredData<T>({
    data,
    filters,
    predicate,
}: Props<T>) {
    return useMemo(() => {
        return data.filter(item =>
            predicate(item, filters)
        );
    }, [
        data,
        filters,
        predicate,
    ]);
}