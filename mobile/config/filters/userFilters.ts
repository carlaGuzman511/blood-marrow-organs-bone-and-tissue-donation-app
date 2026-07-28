import { BLOOD_TYPE_FILTER } from "./bloodTypeFilter";
import { LOCATION_FILTER } from "./cityFilter";
import { FilterGroup } from "@/models/Search.types";

export const USER_FILTERS : FilterGroup[] = [
  BLOOD_TYPE_FILTER,
  LOCATION_FILTER,
];
