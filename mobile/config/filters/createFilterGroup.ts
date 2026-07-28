import { FilterGroup, FilterOption } from "@/models/Search.types";

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