import React from 'react';
import { Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import UserCard from '@/components/UserCard';
import { useDonors } from '@/hooks/useDonors';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useBloodTypes } from '@/hooks/useBloodTypes';
import { resolveBloodTypeId } from '@/utils/resolveBloodTypeId';
import SearchLayout from '@/components/ui/layout/SearchLayout';
import SearchBar from '../../../../components/ui/SearchBar';
import SearchFilterControls from '../../../../components/ui/SearchFilterControls';
import ActiveFilters from '../../../../components/ui/ActiveFilters';
import SearchResultCount from '../../../../components/ui/SearchResultCount';
import { USER_FILTERS } from '@/config/filters/userFilters';
import styles from './SearchUsers.styles';

export default function SearchUsers() {
  const router = useRouter();
  const { filters, setSearch, setFilter, removeFilter } = useSearchFilters();
  const search = useDebouncedValue(filters.search);
  const { data: bloodTypes = [], isSuccess: bloodTypesLoaded } = useBloodTypes();
  const bloodTypeName = filters.values.bloodType;

  // Filtered by the API, one page at a time; wait for the blood types to turn a name into an id.
  const { items: users, totalCount, loadMore } = useDonors(
    { search, bloodTypeId: resolveBloodTypeId(bloodTypeName, bloodTypes), city: filters.values.location },
    !bloodTypeName || bloodTypesLoaded,
  );

  return (
    <SearchLayout title="Search Donors" onBack={() => router.back()}>
      <SearchBar
        value={filters.search}
        onChangeText={setSearch}
        placeholder="Search donors"
      />
      <SearchFilterControls groups={USER_FILTERS} values={filters.values} onChange={setFilter} />

      <ActiveFilters filters={filters.values} filterGroups={USER_FILTERS} onRemove={removeFilter} />
      <SearchResultCount count={totalCount} />

      <FlatList
        data={users}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => <UserCard item={item} />}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No donors match your search.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SearchLayout>
  );
}
