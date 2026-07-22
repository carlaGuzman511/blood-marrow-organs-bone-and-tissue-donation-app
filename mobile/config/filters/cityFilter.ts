import { createFilterGroup } from "@/config/filters/createFilterGroup";
import { CITY_OPTIONS } from "@/constants/cities";
import { FilterGroup } from "@/features/search/types/Search.types";

export const CITY_FILTER: FilterGroup =
    createFilterGroup(
        "location",
        "Location",
        CITY_OPTIONS
    );