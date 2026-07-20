import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '@/constants';
import FilterButton from '../FilterButton';
import FilterBottomSheet from '../FilterBottomSheet';
import type { FilterGroup, SearchFilters } from '../../types/Search.types';

type Props = {
  search: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  filterGroups?: FilterGroup[];
  filters?: SearchFilters['values'];
  onFilterChange?: (key: string, value: string) => void;
};

export default function SearchBar({
  search,
  onSearch,
  placeholder = 'Search',
  filterGroups = [],
  filters = {},
  onFilterChange,
}: Props) {
  const [activeGroup, setActiveGroup] = useState<FilterGroup | null>(null);

  const hasActiveFilters = useMemo(() => Object.values(filters).some(Boolean), [filters]);

  const openFilterSheet = (group: FilterGroup) => {
    setActiveGroup(group);
  };

  const handleSelect = (value: string) => {
    if (!activeGroup || !onFilterChange) {
      return;
    }

    onFilterChange(activeGroup.key, value);
    setActiveGroup(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color={COLORS.black} />
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={onSearch}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          returnKeyType="search"
        />
        {search ? (
          <Pressable onPress={() => onSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.gray} />
          </Pressable>
        ) : null}
      </View>

      {filterGroups.length ? (
        <View style={styles.filterRow}>
          {filterGroups.map((group) => {
            const selectedValue = filters[group.key] ?? '';
            const isActive = Boolean(selectedValue);

            return (
              <FilterButton
                key={group.key}
                label={group.title}
                active={isActive}
                onPress={() => openFilterSheet(group)}
              />
            );
          })}
        </View>
      ) : null}

      {hasActiveFilters ? (
        <Text style={styles.filterHint}>Filters applied</Text>
      ) : null}

      <FilterBottomSheet
        visible={Boolean(activeGroup)}
        title={activeGroup?.title ?? 'Filter'}
        options={activeGroup?.options ?? []}
        selectedValue={activeGroup ? filters[activeGroup.key] ?? '' : ''}
        onSelect={handleSelect}
        onClose={() => setActiveGroup(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryWhite,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    color: COLORS.black,
    fontSize: 15,
    fontFamily: FONTS.body4.fontFamily,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterHint: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.body4.fontFamily,
  },
});
