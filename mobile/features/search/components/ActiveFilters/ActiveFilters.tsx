import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS } from '@/constants';
import type { FilterGroup, SearchFilters } from '../../types/Search.types';

type Props = {
  filters: SearchFilters['values'];
  filterGroups: FilterGroup[];
  onRemove: (key: string) => void;
};

export default function ActiveFilters({ filters, filterGroups, onRemove }: Props) {
  const activeFilters = filterGroups.filter((group) => Boolean(filters[group.key]));

  if (!activeFilters.length) {
    return null;
  }

  return (
    <View style={styles.row}>
      {activeFilters.map((group) => {
        const value = filters[group.key];
        const label = group.options.find((option) => option.id === value)?.label ?? value;

        return (
          <Pressable
            key={group.key}
            style={styles.chip}
            onPress={() => onRemove(group.key)}
          >
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.icon}>×</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.secondaryWhite,
  },
  label: {
    color: COLORS.black,
    fontSize: 12,
    fontFamily: FONTS.body4.fontFamily,
  },
  icon: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.body4.fontFamily,
  },
});
