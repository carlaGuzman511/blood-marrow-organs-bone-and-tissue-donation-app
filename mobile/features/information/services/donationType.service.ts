import { getLookup } from "@/api/paging";
import { Donation } from "@/models/App.types";

/** All donation types (a small catalog: one page of 100). */
export const getDonationTypes = (): Promise<Donation[]> => getLookup<Donation>('/api/donation-types');
