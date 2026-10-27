import { DonationCenter } from "@/models/App.types";
import { SearchFilters } from "../models/Search.types";
import { normalize } from "@/utils/normalize";

/**
 * Search and city are filtered by the API. Only the "service" chip runs here, on the loaded
 * pages: its labels ("Blood Donation") don't match the API's donation type names yet.
 */
export function filterDonationCenters(
    center: DonationCenter,
    filters: SearchFilters
): boolean {
    const service = normalize(filters.values.service);

    return (
        !service ||
        center.donationTypes?.some(type => normalize(type.name).includes(service)) ||
        normalize(center.name).includes(service)
    );
}
