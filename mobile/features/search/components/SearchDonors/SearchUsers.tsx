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
import styles from './SearchUsers.styles';

const BLOOD_TYPES = [
  { id: 'A+', label: 'A+' },
  { id: 'A-', label: 'A-' },
  { id: 'B+', label: 'B+' },
  { id: 'B-', label: 'B-' },
  { id: 'O+', label: 'O+' },
  { id: 'O-', label: 'O-' },
  { id: 'AB+', label: 'AB+' },
  { id: 'AB-', label: 'AB-' },
];

const LOCATIONS = [
  { id: 'Cochabamba', label: 'Cochabamba' },
  { id: 'Santa Cruz', label: 'Santa Cruz' },
  { id: 'Tarija', label: 'Tarija' },
  { id: 'La Paz', label: 'La Paz' },
  { id: 'Oruro', label: 'Oruro' },
  { id: 'Potosi', label: 'Potosi' },
  { id: 'Beni', label: 'Beni' },
  { id: 'Pando', label: 'Pando' },
];

export const USER_FILTERS = [
  {
    key: 'bloodType',
    title: 'Blood Type',
    options: BLOOD_TYPES,
  },
  {
    key: 'location',
    title: 'Location',
    options: LOCATIONS,
  },
];

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
