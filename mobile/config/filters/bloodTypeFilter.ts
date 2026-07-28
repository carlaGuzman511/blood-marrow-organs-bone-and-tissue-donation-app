import { BLOOD_TYPE_OPTIONS } from "@/constants/bloodTypes";
import { createFilterGroup } from "@/config/filters/createFilterGroup";
import { FilterGroup } from "@/models/Search.types";

export const BLOOD_TYPE_FILTER: FilterGroup =
    createFilterGroup(
        "bloodType",
        "Blood Type",
        BLOOD_TYPE_OPTIONS
    );