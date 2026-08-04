import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CardHeader from "@/components/ui/CardHeader";
import AppText from "@/components/ui/AppText";
import { COLORS } from "@/constants";
import styles from "./DonationCardBody.styles";
import { DonationPost } from "@/models/App.types";

type Props = {
  item: DonationPost;
};

export default function DonationCardBody({ item }: Props) {
  const user = item.user;
  const center = item.donationCenter;

  return (
    <View style={styles.body}>
      <CardHeader
        name={user?.fullName || center?.name || ""}
        city={user?.address || center?.address || ""}
        image={user?.image || center?.image || ""}
        isOpen={false} 
      />
      <AppText preset="h4" style={styles.title} numberOfLines={2}>
        {item.title}
      </AppText>
      <AppText preset="body4" style={styles.description} numberOfLines={3}>
        {item.description}
      </AppText>
      {center?.address && (
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={18}
            color={COLORS.primary}
            style={styles.locationIcon}
          />
          <AppText preset="body4" style={styles.locationText} numberOfLines={1}>
            {center.address}
          </AppText>
        </View>
      )}
    </View>
  );
}