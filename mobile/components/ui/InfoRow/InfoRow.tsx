import React, { memo } from "react";
import {
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import AppText from "../AppText";

import styles from "./InfoRow.styles";

type Props = {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    color?: string;
};

function InfoRow({
    icon,
    value,
    color,
}: Props) {
    return (
        <View style={styles.container}>
            <Ionicons
                name={icon}
                size={18}
                color={color}
            />
            <AppText
                preset="body4"
                style={styles.text}
                numberOfLines={2}
            >
                {value}
            </AppText>
        </View>
    );
}

export default memo(InfoRow);