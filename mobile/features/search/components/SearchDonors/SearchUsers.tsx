import React from 'react';
import { Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import UserCard from '@/components/UserCard';
import { useUsers } from '@/hooks/useUsers';
import { useSearchFilters } from '../../hooks/useSearchFilters';
import { useFilteredData } from '../../hooks/useFilteredData';
import SearchLayout from '@/components/ui/layout/SearchLayout';
import SearchBar from '../SearchBar';
import ActiveFilters from '../ActiveFilters';
import SearchResultCount from '../SearchResultCount';
import type { SearchFilters } from '../../types/Search.types';
import type { User } from '@/models/App.types';
import { USER_FILTERS } from '@/config/filters/userFilters';
import styles from './SearchUsers.styles';


function filterUsers(item: User, filters: SearchFilters) {
  const query = filters.search.trim().toLowerCase();
  const bloodType = filters.values.bloodType?.trim().toLowerCase() ?? '';
  const location = filters.values.location?.trim().toLowerCase() ?? '';

  const matchesQuery = !query || item.fullName.toLowerCase().includes(query);
  const matchesBloodType = !bloodType || item.bloodTypeId?.toLowerCase() === bloodType;
  const matchesLocation = !location || item.address.toLowerCase().includes(location);

  return matchesQuery && matchesBloodType && matchesLocation;
}

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
        search={filters.search}
        onSearch={setSearch}
        placeholder="Search donors"
        filterGroups={USER_FILTERS}
        filters={filters.values}
        onFilterChange={setFilter}
      />

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