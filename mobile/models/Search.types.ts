import { DonationCenter, User } from "@/models/App.types";

export interface FilterOption {
    id: string;
    label: string;
}

export interface FilterGroup {
    key: string;
    title: string;
    options: FilterOption[];
}

export interface SearchFilters {
    search: string;
    values: Record<string, string>;
}

// export interface FilterOption {
//     value: string;
//     label: string;
// }

export interface UserFilterValues {
    bloodType?: string;
    location?: string;
}

export interface DonationCenterFilterValues {
    city?: string;
    service?: string;
}

export type UserFilterPredicate = (
    user: User,
    filters: SearchFilters
) => boolean;

export type DonationCenterFilterPredicate = (
    center: DonationCenter,
    filters: SearchFilters
) => boolean;