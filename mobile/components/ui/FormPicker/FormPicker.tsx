import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { COLORS } from "@/constants";
import styles from "./FormPicker.styles";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: string[];
  placeholder?: string;
};

export default function FormPicker<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Select",
}: Props<T>) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          <TouchableOpacity
            style={[styles.pickerButton, error && styles.errorInput]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: value ? COLORS.black : COLORS.gray }}>
              {value || placeholder}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error.message}</Text>}

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={options}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => {
                        onChange(item);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={[styles.optionText, value === item && styles.selectedOption]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        </View>
      )}
    />
  );
}
