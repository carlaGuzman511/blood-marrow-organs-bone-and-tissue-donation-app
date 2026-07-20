import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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