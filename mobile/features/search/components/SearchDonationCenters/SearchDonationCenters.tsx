import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import DonationCenterCard from '@/features/donation-centers/components/DonationCenterCard';
import { useDonationCenters } from '@/features/donation-centers/hooks/useDonationCenters';
import { useSearchFilters } from '../../hooks/useSearchFilters';
import { useFilteredData } from '../../hooks/useFilteredData';
import SearchLayout from '../../../../components/ui/layout/SearchLayout';
import SearchBar from '../SearchBar';
import ActiveFilters from '../ActiveFilters';
import SearchResultCount from '../SearchResultCount';
import type { DonationCenter } from '@/models/App.types';
import type { SearchFilters } from '../../types/Search.types';
import styles from './SearchDonationCenters.styles';
import { DONATION_CENTER_FILTERS } from '@/config/filters/donationCenterFilters';

function filterCenters(item: DonationCenter, filters: SearchFilters) {
  const query = filters.search.trim().toLowerCase();
  const city = filters.values.city?.trim().toLowerCase() ?? '';
  const service = filters.values.service?.trim().toLowerCase() ?? '';

  const matchesQuery = !query || item.name.toLowerCase().includes(query) || item.address.toLowerCase().includes(query);
  const matchesCity = !city || item.city.toLowerCase().includes(city);
  const matchesService = !service ||
    item.donationTypes?.some((type) => type.name.toLowerCase().includes(service)) ||
    item.name.toLowerCase().includes(service);

  return matchesQuery && matchesCity && matchesService;
}

export default function SearchDonationCenters() {
  const router = useRouter();
  const { filters, setSearch, setFilter, removeFilter } = useSearchFilters();
  const { data: donationCenters = [] } = useDonationCenters();

  const filteredCenters = useFilteredData({
    data: donationCenters,
    filters,
    predicate: filterCenters,
  });

  return (
    <SearchLayout title="Search Centers" onBack={() => router.back()}>
      <SearchBar
        search={filters.search}
        onSearch={setSearch}
        placeholder="Search centers"
        filterGroups={DONATION_CENTER_FILTERS}
        filters={filters.values}
        onFilterChange={setFilter}
      />

      <ActiveFilters filters={filters.values} filterGroups={DONATION_CENTER_FILTERS} onRemove={removeFilter} />
      <SearchResultCount count={filteredCenters.length} />

      <FlatList
        data={filteredCenters}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => <DonationCenterCard item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No donation centers match your filters.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SearchLayout>
  );
}