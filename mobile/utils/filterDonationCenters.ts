import { DonationCenter } from "@/models/App.types";
import { SearchFilters } from "../models/Search.types";
import { normalize } from "@/utils/normalize";

export function filterDonationCenters(
    center: DonationCenter,
    filters: SearchFilters
): boolean {

    const search =
        normalize(filters.search);

    const city =
        normalize(filters.values.city);

    const service =
        normalize(filters.values.service);

    const bySearch =
        !search ||
        normalize(center.name).includes(search) ||
        normalize(center.address).includes(search);

    const byCity =
        !city ||
        normalize(center.city).includes(city);

    const byService =
        !service ||
        center.donationTypes?.some(type =>
            normalize(type.name).includes(service)
        ) ||
        normalize(center.name).includes(service);

    return (
        bySearch &&
        byCity &&
        byService
    );
}
