import React from 'react';
import { Pressable, Text } from 'react-native';
import styles from './FilterButton.styles';

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