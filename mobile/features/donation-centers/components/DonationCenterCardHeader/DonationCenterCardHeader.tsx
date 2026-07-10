import React, { memo } from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";
import StatusBadge from "@/components/ui/StatusBadge";

import styles from "./DonationCenterCardHeader.styles";

type Props = {
    name: string;
    city: string;
    image: string;
    isOpen?: boolean;
};

function DonationCenterCardHeader({
    name,
    city,
    image,
    isOpen = true,
}: Props) {
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: image }}
                style={styles.avatar}
            />
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <AppText
                        variant="title"
                        numberOfLines={1}
                        style={styles.name}
                    >
                        {name}
                    </AppText>
                    <StatusBadge
                        label={isOpen ? "Open" : "Closed"}
                        variant={isOpen ? "success" : "danger"}
                    />
                </View>
                <View style={styles.locationContainer}>
                    <Ionicons
                        name="location-outline"
                        size={16}
                        color="#6B7280"
                    />
                    <AppText
                        variant="caption"
                        style={styles.city}
                    >
                        {city}
                    </AppText>
                </View>
            </View>
        </View>
    );
}

export default memo(DonationCenterCardHeader);