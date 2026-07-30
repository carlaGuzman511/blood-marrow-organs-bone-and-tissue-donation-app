import React, { memo } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";

import styles from "./DonationCenterCardFooter.styles";
import { COLORS, SIZES } from "@/constants";

type Props = {
    isOpen: boolean;
    distance?: string;
    openingHours?: string;
    onPress?: () => void;
};

function DonationCenterCardFooter({
    isOpen,
    distance,
    openingHours,
    onPress,
}: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                <View style={styles.statusRow}>
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor: isOpen
                                    ? COLORS.success
                                    : COLORS.error,
                            },
                        ]}
                    />
                    <AppText
                        preset="body4"
                        style={[
                            styles.statusText,
                            {
                                color: isOpen
                                    ? COLORS.success
                                    : COLORS.error,
                            },
                        ]}
                    >
                        {isOpen ? "Open Now" : "Closed"}
                    </AppText>
                </View>
                {!!openingHours && (
                    <AppText
                        preset="body4"
                        style={styles.hours}
                    >
                        {openingHours}
                    </AppText>
                )}
            </View>
            <View style={styles.rightContainer}>
                {!!distance && (
                    <View style={styles.distanceContainer}>
                        <Ionicons
                            name="navigate-outline"
                            size={16}
                            color={COLORS.secondaryBlack}
                        />
                        <AppText
                            preset="body4"
                            style={styles.distance}
                        >
                            {distance}
                        </AppText>
                    </View>
                )}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPress}
                    style={styles.button}
                >
                    <AppText
                        preset="body4"
                        style={styles.buttonText}
                    >
                        View Details
                    </AppText>
                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={COLORS.primary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default memo(DonationCenterCardFooter);