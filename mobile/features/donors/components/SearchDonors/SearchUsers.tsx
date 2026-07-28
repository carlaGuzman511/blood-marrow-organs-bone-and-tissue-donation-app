import React from 'react';
import { Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import UserCard from '@/components/UserCard';
import { useUsers } from '@/hooks/useUsers';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useFilteredData } from '@/hooks/useFilteredData';
import SearchLayout from '@/components/ui/layout/SearchLayout';
import SearchBar from '../../../../components/ui/SearchBar';
import SearchFilterControls from '../../../../components/ui/SearchFilterControls';
import ActiveFilters from '../../../../components/ui/ActiveFilters';
import SearchResultCount from '../../../../components/ui/SearchResultCount';
import { USER_FILTERS } from '@/config/filters/userFilters';
import { filterUsers } from '@/utils/filterUsers';
import styles from './SearchUsers.styles';

export default function SearchUsers() {
  const router = useRouter();
  const { filters, setSearch, setFilter, removeFilter } = useSearchFilters();
  const { data: users = [] } = useUsers();

  const filteredUsers = useFilteredData({
    data: users,
    filters,
    predicate: filterUsers,
  });

  return (
    <SearchLayout title="Search Donors" onBack={() => router.back()}>
      <SearchBar
        value={filters.search}
        onChangeText={setSearch}
        placeholder="Search donors"
      />
      <SearchFilterControls groups={USER_FILTERS} values={filters.values} onChange={setFilter} />

      <ActiveFilters filters={filters.values} filterGroups={USER_FILTERS} onRemove={removeFilter} />
      <SearchResultCount count={filteredUsers.length} />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => <UserCard item={item} />}
        contentContainerStyle={styles.list}
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
