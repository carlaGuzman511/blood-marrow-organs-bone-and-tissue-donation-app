import React, { useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, SectionList } from 'react-native';
import { useDonationTypes } from '@/features/information/hooks/useDonationTypes';
import { Donation } from '@/models/App.types';
import { HeroCard } from '@/features/information/components';
import SearchBar from '@/components/ui/SearchBar';
import { useStyles } from '../styles';

export default function InformationScreen() {
  const styles = useStyles();
  const { data, isLoading, isError } = useDonationTypes();
  const [search, setSearch] = useState('');
  const sections = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return ((data ?? []) as Donation[])
      .filter((item) => {
        if (!query) return true;

        return [item.name, item.description, item.requirements]
          .some((value) => value.toLocaleLowerCase().includes(query));
      })
      .map((item) => ({ title: item.name, data: [item] }));
  }, [data, search]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Unable to load donation types.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search donation types"
        />
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <HeroCard item={item} />
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No donation types match your search.</Text>}
      />
    </View>
  );
}
