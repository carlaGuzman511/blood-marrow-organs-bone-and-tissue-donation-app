import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/ui/AppText";
import { COLORS } from "@/constants";
import styles from "./DonationCenterCardFooter.styles";

type Props = {
  isOpen: boolean;
  distance?: string;
  onPress?: () => void;
};

const DonationCenterCardFooter = ({ isOpen, distance, onPress }: Props) => {
  const statusLabel = isOpen ? "Open" : "Closed";
  const statusColor = isOpen ? COLORS.success : COLORS.danger;

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, isOpen ? styles.open : styles.closed]} />
        <AppText style={[styles.statusText, { color: statusColor }]}>
          {statusLabel}
        </AppText>
      </View>

      {distance && (
        <View style={styles.distanceRow}>
          <Ionicons name="location-outline" size={18} color={COLORS.secondaryGray} />
          <AppText preset="body4" style={styles.distanceText}>
            {distance}
          </AppText>
        </View>
      )}
    </View>
  );
};

export default DonationCenterCardFooter;