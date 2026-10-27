import { BloodType } from "@/models/App.types";
import { NO_MATCH_ID } from "@/api/paging";

/**
 * The API filters by blood type id; the filter chips hold names ("A+").
 * No name: no filter. A name the API doesn't have: a filter that matches nothing.
 */
export function resolveBloodTypeId(name: string | undefined, bloodTypes: BloodType[]): string | undefined {
  if (!name) return undefined;
  const match = bloodTypes.find((bloodType) => bloodType.name.trim().toUpperCase() === name.trim().toUpperCase());
  return match ? String(match.id) : NO_MATCH_ID;
}
