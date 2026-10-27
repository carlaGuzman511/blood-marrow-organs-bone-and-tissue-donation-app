import React from 'react';
import { Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import DonationCenterCard from '@/features/donation-centers/components/DonationCenterCard';
import { useDonationCenters } from '@/features/donation-centers/hooks/useDonationCenters';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useFilteredData } from '@/hooks/useFilteredData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import SearchLayout from '../../../../components/ui/layout/SearchLayout';
import SearchBar from '../../../../components/ui/SearchBar';
import SearchFilterControls from '../../../../components/ui/SearchFilterControls';
import ActiveFilters from '../../../../components/ui/ActiveFilters';
import SearchResultCount from '../../../../components/ui/SearchResultCount';
import styles from './SearchDonationCenters.styles';
import { DONATION_CENTER_FILTERS } from '@/config/filters/donationCenterFilters';
import { filterDonationCenters } from '@/utils/filterDonationCenters';

export function DonationCenterSearchContent() {
  const { filters, setSearch, setFilter, removeFilter } = useSearchFilters();
  const search = useDebouncedValue(filters.search);
  const { items: donationCenters, totalCount, loadMore } = useDonationCenters({ search, city: filters.values.location });

  const filteredCenters = useFilteredData({
    data: donationCenters,
    filters,
    predicate: filterDonationCenters,
  });

  return (
    <>
      <SearchBar
        value={filters.search}
        onChangeText={setSearch}
        placeholder="Search centers"
      />
      <SearchFilterControls groups={DONATION_CENTER_FILTERS} values={filters.values} onChange={setFilter} />

      <ActiveFilters filters={filters.values} filterGroups={DONATION_CENTER_FILTERS} onRemove={removeFilter} />
      <SearchResultCount count={filters.values.service ? filteredCenters.length : totalCount} />

      <FlatList
        data={filteredCenters}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => <DonationCenterCard item={item} />}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No donation centers match your filters.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

export default function SearchDonationCenters() {
  const router = useRouter();

  return (
    <SearchLayout title="Search Centers" onBack={() => router.back()}>
      <DonationCenterSearchContent />
    </SearchLayout>
  );
}
