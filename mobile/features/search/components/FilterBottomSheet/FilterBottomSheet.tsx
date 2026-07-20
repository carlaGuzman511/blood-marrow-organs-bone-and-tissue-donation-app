import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS, FONTS } from '@/constants';
import type { FilterOption } from '../../types/Search.types';

type Props = {
  visible: boolean;
  title: string;
  options: FilterOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export default function FilterBottomSheet({
  visible,
  title,
  options,
  selectedValue = '',
  onSelect,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {options.map((option) => {
              const isSelected = selectedValue === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.option, isSelected && styles.selectedOption]}
                  onPress={() => onSelect(option.id)}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.selectedLabel]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.h4.fontFamily,
    color: COLORS.black,
  },
  close: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.body4.fontFamily,
  },
  list: {
    width: '100%',
  },
  listContent: {
    gap: 8,
  },
  option: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondaryWhite,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryWhite,
  },
  optionLabel: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.body4.fontFamily,
  },
  selectedLabel: {
    color: COLORS.primary,
    fontFamily: FONTS.h4.fontFamily,
  },
});
