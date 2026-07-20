import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

import { COLORS } from "@/constants";
import styles from "./PrimaryButton.styles";

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
