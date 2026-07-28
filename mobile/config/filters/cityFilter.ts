import { createFilterGroup } from "@/config/filters/createFilterGroup";
import { LOCATION_OPTIONS } from "@/constants/locations";
import { FilterGroup } from "@/models/Search.types";

export const LOCATION_FILTER: FilterGroup =
    createFilterGroup(
        "location",
        "Location",
        LOCATION_OPTIONS
    );