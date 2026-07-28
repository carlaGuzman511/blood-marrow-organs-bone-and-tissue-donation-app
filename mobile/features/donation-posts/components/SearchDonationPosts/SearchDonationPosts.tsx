import React from 'react';
import { Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import SearchLayout from '@/components/ui/layout/SearchLayout';
import DonationCard from '@/features/donation-posts/components/DonationCard';
import { useDonationPosts } from '@/hooks/useDonationPosts';
import { DONATION_POST_FILTERS } from '@/config/filters/donationPostFilters';
import { useFilteredData } from '@/hooks/useFilteredData';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { filterDonationPosts } from '@/utils/filterDonationPosts';
import ActiveFilters from '../../../../components/ui/ActiveFilters';
import SearchBar from '../../../../components/ui/SearchBar';
import SearchFilterControls from '../../../../components/ui/SearchFilterControls';
import SearchResultCount from '../../../../components/ui/SearchResultCount';
import styles from './SearchDonationPosts.styles';

export function DonationPostSearchContent() {
  const { data: posts = [], isLoading, error } = useDonationPosts();

  const { filters, setSearch, setFilter, removeFilter } = useSearchFilters();
  const filteredPosts = useFilteredData({ data: posts, filters, predicate: filterDonationPosts });
  
  return (
    <>
      <SearchBar 
        value={filters.search} 
        onChangeText={setSearch} 
        placeholder="Search donation requests" />
      <SearchFilterControls groups={DONATION_POST_FILTERS} values={filters.values} onChange={setFilter} />
      <ActiveFilters filters={filters.values} filterGroups={DONATION_POST_FILTERS} onRemove={removeFilter} />
      <SearchResultCount count={filteredPosts.length} />
      <FlatList
        data={filteredPosts}
        keyExtractor={(item, index) => item.id ?? String(index)}
        renderItem={({ item }) => <DonationCard item={item} onPress={() => undefined} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No donation requests match your search.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

export default function SearchDonationPosts() {
  const router = useRouter();

  return (
    <SearchLayout title="Search Posts" onBack={() => router.back()}>
      <DonationPostSearchContent />
    </SearchLayout>
  );
}
