import { FilterGroup, FilterOption } from "@/features/search/types/Search.types";

export function createFilterGroup(
    key: string,
    title: string,
    options: FilterOption[]
): FilterGroup {
    return {
        key,
        title,
        options,
    };
}