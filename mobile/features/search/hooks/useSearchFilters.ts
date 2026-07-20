import { useCallback, useState } from "react";
import { SearchFilters } from "../types/Search.types";

const INITIAL_FILTERS: SearchFilters = {
    search: "",
    values: {},
};

export function useSearchFilters() {
    const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);

    const setSearch = useCallback((search: string) => {
        setFilters(previous => ({
            ...previous,
            search,
        }));
    }, []);

    const setFilter = useCallback(
        (key: string, value: string) => {
            setFilters(previous => ({
                ...previous,
                values: {
                    ...previous.values,
                    [key]: value,
                },
            }));
        },
        []
    );

    const clearFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);


    
    const removeFilter = useCallback((key: string) => {
        setFilters(previous => {
            const values = {
                ...previous.values,
            };

            delete values[key];
            
            return {
                ...previous,
                values,
            };
        });
    }, []);


    return {
        filters,
        setSearch,
        setFilter,
        removeFilter,
        clearFilters,
    };
}
