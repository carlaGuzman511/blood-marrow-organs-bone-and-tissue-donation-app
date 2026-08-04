import React from "react";
import { View, Text } from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import BloodTypeBadge from "../../../../components/ui/BloodTypeBadge/BloodTypeBadge";

import styles from "./DonationCardHeader.styles";
import { DonationPost } from "@/models/App.types";

dayjs.extend(relativeTime);

type Props = {
    item: DonationPost;
};

export default function DonationCardHeader({ item }: Props) {
  const isUrgent = item.urgent || false; 

  return (
    <View style={styles.header}>
      <View style={styles.leftGroup}>
        <BloodTypeBadge bloodType={item.bloodType} />
        {isUrgent && <View style={styles.urgencyDot} />}
      </View>
      <Text style={styles.time}>{dayjs(item.createdAt).fromNow()}</Text>
    </View>
  );
}