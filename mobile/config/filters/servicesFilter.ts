import { createFilterGroup } from "@/config/filters/createFilterGroup";
import { FilterGroup } from "@/features/search/types/Search.types";
import { SERVICE_OPTIONS } from "@/constants/services";

export const SERVICE_FILTER: FilterGroup =
    createFilterGroup(
        "service",
        "Service",
        SERVICE_OPTIONS
    );
    