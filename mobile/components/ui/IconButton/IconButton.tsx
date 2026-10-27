import React, { memo } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { hitSlopFor, makeStyles, useTheme } from "@/theme";
import type { IconName } from "../AppButton";

type Props = {
    icon: IconName;
    /** Required: an icon alone says nothing to a screen reader. */
    accessibilityLabel: string;
    onPress?: () => void;
    /** Drawn size (the Stitch screens use 40-44px). The touch area is always at least 48x48. */
    size?: number;
    variant?: "plain" | "tonal";
    color?: string;
    disabled?: boolean;
    testID?: string;
    style?: StyleProp<ViewStyle>;
};

const useStyles = makeStyles((t) => ({
    base: { alignItems: "center", justifyContent: "center", borderRadius: t.radius.md },
    tonal: { backgroundColor: t.colors.surfaceRecessed },
    pressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
    disabled: { opacity: 0.4 },
}));

function IconButton({
    icon,
    accessibilityLabel,
    onPress,
    size = 40,
    variant = "plain",
    color,
    disabled = false,
    testID,
    style,
}: Props) {
    const styles = useStyles();
    const { colors } = useTheme();

    return (
        <Pressable
            testID={testID}
            onPress={onPress}
            disabled={disabled}
            hitSlop={hitSlopFor(size)}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ disabled }}
            style={({ pressed }) => [
                styles.base,
                { width: size, height: size },
                variant === "tonal" && styles.tonal,
                pressed && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            <MaterialIcons name={icon} size={Math.round(size / 2)} color={color ?? colors.text} />
        </Pressable>
    );
}

export default memo(IconButton);
