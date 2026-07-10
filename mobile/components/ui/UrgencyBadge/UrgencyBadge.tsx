import React from "react";
import { View, Text } from "react-native";
import styles from "./UrgencyBadge.styles";
import { COLORS } from "@/theme/colors";

type Props = {
    urgency: "Critical" | "High" | "Normal";
};

const colors = {
    Critical: COLORS.danger,
    High: COLORS.warning,
    Normal: COLORS.success,
};

export default function UrgencyBadge({ urgency }: Props) {
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors[urgency],
                },
            ]}
        >
            <Text style={styles.text}>
                {urgency}
            </Text>
        </View>
    );
}
