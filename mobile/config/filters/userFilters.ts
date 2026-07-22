import { BLOOD_TYPE_FILTER } from "./bloodTypeFilter";
import { CITY_FILTER } from "./cityFilter";
import { FilterGroup } from "@/features/search/types/Search.types";

export const USER_FILTERS : FilterGroup[] = [
  BLOOD_TYPE_FILTER,
  CITY_FILTER,
];