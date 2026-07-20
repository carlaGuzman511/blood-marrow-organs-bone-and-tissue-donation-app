import React from 'react';
import { View, Text, ActivityIndicator, SectionList } from 'react-native';
import { useDonationTypes } from '@/features/information/hooks/useDonationTypes';
import { Donation } from '@/models/App.types';
import { HeroCard } from '@/features/information/components';
import { styles } from '../styles';

export default function InformationScreen() {
  const { data, isLoading, isError } = useDonationTypes();

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

  const sections = (data as Donation[]).map((item: Donation) => ({
    title: item.name,
    data: [item],
  }));

  return (
    <View style={styles.container}>
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
      />
    </View>
  );
}
