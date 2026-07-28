import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import FilterBottomSheet from '../FilterBottomSheet';
import FilterButton from '../FilterButton';
import styles from './SearchFilterControls.styles';
import type { FilterGroup } from '@/models/Search.types';

type Props = {
  groups: readonly FilterGroup[];
  values: Readonly<Record<string, string>>;
  onChange: (key: string, value: string) => void;
};

/** UI-only filter selector. State ownership stays with the consuming screen/hook. */
export default function SearchFilterControls({ groups, values, onChange }: Props) {
  const [activeGroup, setActiveGroup] = useState<FilterGroup | null>(null);
  const hasActiveFilters = useMemo(() => Object.values(values).some(Boolean), [values]);

  if (!groups.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {groups.map((group) => (
          <FilterButton
            key={group.key}
            label={group.title}
            active={Boolean(values[group.key])}
            onPress={() => setActiveGroup(group)}
          />
        ))}
      </View>
      {hasActiveFilters ? <Text style={styles.hint}>Filters applied</Text> : null}
      <FilterBottomSheet
        visible={Boolean(activeGroup)}
        title={activeGroup?.title ?? 'Filter'}
        options={activeGroup?.options ?? []}
        selectedValue={activeGroup ? values[activeGroup.key] ?? '' : ''}
        onSelect={(value) => {
          if (activeGroup) onChange(activeGroup.key, value);
          setActiveGroup(null);
        }}
        onClose={() => setActiveGroup(null)}
      />
    </View>
  );
}
