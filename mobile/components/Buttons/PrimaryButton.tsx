import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

import { COLORS } from "@/constants";

type Props = {
    title: string;
    onPress: () => void;
};

export default function PrimaryButton({
    title,
    onPress,
}: Props) {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
        >
            <Text style={styles.text}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        color: "white",
        fontWeight: "700",
        fontSize: 15,
    },
});