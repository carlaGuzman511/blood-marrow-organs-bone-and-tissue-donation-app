import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS, FONTS } from '@/constants';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export default function FilterButton({ label, active = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, active && styles.activeButton]}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.secondaryWhite,
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  label: {
    color: COLORS.black,
    fontSize: 12,
    fontFamily: FONTS.body4.fontFamily,
  },
  activeLabel: {
    color: COLORS.white,
  },
});
