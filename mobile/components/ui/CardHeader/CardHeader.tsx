import React, { memo } from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";
import StatusBadge from "@/components/ui/StatusBadge";

import styles from "./CardHeader.styles";
import { COLORS } from "@/constants";

type Props = {
    name: string;
    city: string;
    image: string;
    isOpen?: boolean;
};

function CardHeader({
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
                        preset="h4"
                        numberOfLines={1}
                        style={styles.name}
                    >
                        {name}
                    </AppText>
                    <StatusBadge
                        label={isOpen ? "Available" : "Not Available"}
                        isOpen={isOpen}
                    />
                </View>
                <View style={styles.locationContainer}>
                    <Ionicons
                        name="location-outline"
                        size={16}
                        color={COLORS.primary}
                    />
                    <AppText
                        preset="body4"
                        style={styles.city}
                    >
                        {city}
                    </AppText>
                </View>
            </View>
        </View>
    );
}

export default memo(CardHeader);