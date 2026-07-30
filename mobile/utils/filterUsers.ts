import type { SearchFilters } from '../models/Search.types';
import type { User } from '@/models/App.types';
import { normalize } from "@/utils/normalize";

export function filterUsers(
    user: User,
    filters: SearchFilters
): boolean {

    const search = normalize(filters.search);

    const bloodType =
        normalize(filters.values.bloodType);

    const location =
        normalize(filters.values.location);

    const bySearch =
        !search ||
        normalize(user.fullName).includes(search);

    const byBloodType =
        !bloodType ||
        normalize(user.bloodType.name) === bloodType;

    const byLocation =
        !location ||
        normalize(user.address).includes(location);

    return (
        bySearch &&
        byBloodType &&
        byLocation
    );
}
