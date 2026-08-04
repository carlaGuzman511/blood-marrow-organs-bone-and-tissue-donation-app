import React, { memo } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import AppText from "@/components/ui/AppText";
import styles from "./DonationCenterCardInfo.styles";

type Props = {
    address: string;
    phone?: string;
    email?: string;
    openingHours?: string;
};

function DonationCenterCardInfo({
    address,
    phone,
    email,
    openingHours,
}: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Ionicons name="location-outline" size={18} color={COLORS.primary} style={styles.icon} />
                <AppText preset="body4" style={styles.text} numberOfLines={1}>
                {address}
                </AppText>
            </View>

            {phone && (
                <View style={styles.row}>
                <Ionicons name="call-outline" size={18} color={COLORS.primary} style={styles.icon} />
                <AppText preset="body4" style={styles.text}>{phone}</AppText>
                </View>
            )}

            {email && (
                <View style={styles.row}>
                <Ionicons name="mail-outline" size={18} color={COLORS.primary} style={styles.icon} />
                <AppText preset="body4" style={styles.text}>{email}</AppText>
                </View>
            )}

            {openingHours && (
                <View style={styles.row}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} style={styles.icon} />
                <AppText preset="body4" style={styles.text}>{openingHours}</AppText>
                </View>
            )}
        </View>
)};

export default memo(DonationCenterCardInfo);
