import React, { memo } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
            <InfoRow
                icon="location-outline"
                value={address}
            />
            {phone && (
                <InfoRow
                    icon="call-outline"
                    value={phone}
                />
            )}
            {email && (
                <InfoRow
                    icon="mail-outline"
                    value={email}
                />
            )}
            {openingHours && (
                <InfoRow
                    icon="time-outline"
                    value={openingHours}
                />
            )}
        </View>
    );
}

type InfoRowProps = {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
};

const InfoRow = memo(({ icon, value }: InfoRowProps) => (
    <View style={styles.row}>
        <Ionicons
            name={icon}
            size={18}
            style={styles.icon}
        />
        <AppText
            preset="body4"
            numberOfLines={2}
            style={styles.value}
        >
            {value}
        </AppText>
    </View>
));

export default memo(DonationCenterCardInfo);