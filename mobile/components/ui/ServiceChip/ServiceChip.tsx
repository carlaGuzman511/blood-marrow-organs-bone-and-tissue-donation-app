import React, { memo } from "react";
import { TouchableOpacity } from "react-native";

import AppText from "../AppText";
import styles from "./ServiceChip.styles";

type Props = {
    label: string;
    selected?: boolean;
    onPress?: () => void;
};

function ServiceChip({
    label,
    selected = false,
    onPress,

}: Props) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={!onPress}
            onPress={onPress}
            style={[
                styles.container,
                selected && styles.selected,
            ]}
        >
            <AppText
                variant="caption"
                style={[
                    styles.label,
                    selected && styles.selectedLabel,
                ]}
            >
                {label}
            </AppText>
        </TouchableOpacity>
    );
}

export default memo(ServiceChip);