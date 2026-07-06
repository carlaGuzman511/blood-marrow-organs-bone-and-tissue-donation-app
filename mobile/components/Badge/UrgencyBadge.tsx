import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
    urgency: "Critical" | "High" | "Normal";
};

const colors = {
    Critical: "#D62828",
    High: "#F77F00",
    Normal: "#2A9D8F"
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

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    text: {
        color: "white",
        fontWeight: "700",
        fontSize: 12,
    },
});