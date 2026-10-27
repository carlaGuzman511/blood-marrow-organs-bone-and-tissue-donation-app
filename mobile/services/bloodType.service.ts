import { getLookup } from "@/api/paging";
import { BloodType } from "@/models/App.types";

/** All blood types (a small catalog: one page of 100). */
export const getBloodTypes = (): Promise<BloodType[]> => getLookup<BloodType>('/api/blood-types');
