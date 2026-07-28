import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './SearchBar.styles';
import { COLORS } from '@/constants';

export type SearchBarProps = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'placeholder' | 'style'
> & {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  accessibilityLabel = placeholder,
  ...inputProps
}: SearchBarProps) {
  return (
    <View style={styles.searchRow}>
      <Ionicons name="search-outline" size={20} color={COLORS.black} />
      <TextInput
        {...inputProps}
        accessibilityLabel={accessibilityLabel}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        returnKeyType="search"
      />
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={COLORS.gray} />
        </Pressable>
      ) : null}
    </View>
  );
}
