import React, { memo } from "react";
import { ActivityIndicator, Pressable, StyleProp, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import AppText from "../AppText";
import { useStyles } from "./AppButton.styles";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

type Props = {
    title: string;
    onPress?: () => void;
    /** primary: urgent / core action. secondary: medical / logistics. ghost: low emphasis. */
    variant?: ButtonVariant;
    icon?: IconName;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    testID?: string;
    style?: StyleProp<ViewStyle>;
};

/** DESIGN.md "Buttons": 48px minimum height, 12px radius, pressed state with a 0.98 scale. */
function AppButton({
    title,
    onPress,
    variant = "primary",
    icon,
    loading = false,
    disabled = false,
    fullWidth = false,
    accessibilityLabel,
    accessibilityHint,
    testID,
    style,
}: Props) {
    const styles = useStyles();
    const inactive = disabled || loading;
    const look = {
        primary: { rest: styles.primary, pressed: styles.primaryPressed, label: styles.primaryLabel, labelPressed: styles.primaryLabel },
        secondary: { rest: styles.secondary, pressed: styles.secondaryPressed, label: styles.secondaryLabel, labelPressed: styles.secondaryLabelPressed },
        ghost: { rest: styles.ghost, pressed: styles.ghostPressed, label: styles.ghostLabel, labelPressed: styles.ghostLabel },
    }[variant];

    return (
        <Pressable
            testID={testID}
            onPress={onPress}
            disabled={inactive}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ disabled: inactive, busy: loading }}
            style={({ pressed }) => [
                styles.base,
                look.rest,
                pressed && look.pressed,
                pressed && styles.pressed,
                inactive && styles.disabled,
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            {({ pressed }) => {
                const labelStyle = inactive ? styles.disabledLabel : pressed ? look.labelPressed : look.label;
                const color = labelStyle.color as string;

                return (
                    <>
                        {loading ? (
                            <ActivityIndicator size="small" color={color} />
                        ) : (
                            icon && <MaterialIcons name={icon} size={20} color={color} />
                        )}
                        <AppText variant="labelMd" style={labelStyle} numberOfLines={1}>
                            {title}
                        </AppText>
                    </>
                );
            }}
        </Pressable>
    );
}

export default memo(AppButton);
