import React, { forwardRef, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";

import { MAX_FONT_SCALE, useTheme } from "@/theme";
import AppText from "../AppText";
import { useStyles } from "./TextField.styles";

export type TextFieldProps = TextInputProps & {
    label: string;
    /** Shown under the field, announced by screen readers, and turns the border red. */
    error?: string;
    helperText?: string;
};

/** DESIGN.md "Text Inputs": 52px, 12px radius, #F8FAFC fill; on focus white with a 2px blue outline. */
const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
    { label, error, helperText, multiline, onFocus, onBlur, style, ...props },
    ref,
) {
    const styles = useStyles();
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.container}>
            {/* The input carries the label for screen readers; hide the visible copy so it isn't read twice. */}
            <AppText variant="labelMd" color={colors.text} accessibilityElementsHidden importantForAccessibility="no">
                {label}
            </AppText>
            <View
                testID="text-field-box"
                style={[styles.field, focused && styles.focused, !!error && styles.invalid]}
            >
                <TextInput
                    ref={ref}
                    {...props}
                    multiline={multiline}
                    accessibilityLabel={label}
                    accessibilityHint={error ?? helperText}
                    placeholderTextColor={colors.textMuted}
                    selectionColor={colors.focus}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                    onFocus={(event) => {
                        setFocused(true);
                        onFocus?.(event);
                    }}
                    onBlur={(event) => {
                        setFocused(false);
                        onBlur?.(event);
                    }}
                    style={[styles.input, multiline && styles.multiline, style]}
                />
            </View>
            {error ? (
                <AppText
                    variant="bodySm"
                    color={colors.error}
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                >
                    {error}
                </AppText>
            ) : helperText ? (
                <AppText variant="bodySm" color={colors.textMuted}>
                    {helperText}
                </AppText>
            ) : null}
        </View>
    );
});

export default TextField;
