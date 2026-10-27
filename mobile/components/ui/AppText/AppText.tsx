import React, { memo } from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";

import { FontWeight, fontFor, MAX_FONT_SCALE, TextVariant, useTheme } from "@/theme";

/** Old size names mapped to the type scale (same mapping as the legacy FONTS bridge). */
const LEGACY_PRESETS = {
    largeTitle: "displayLg",
    h1: "headlineXlMobile",
    h2: "headlineLg",
    h3: "headlineMd",
    h4: "titleSm",
    body1: "bodyLg",
    body2: "bodyLg",
    body3: "bodySm",
    body4: "bodySm",
} satisfies Record<string, TextVariant>;

type LegacyPreset = keyof typeof LEGACY_PRESETS;

type Props = TextProps & {
    /** Type scale from the design system. Default `bodySm` (the old default size). */
    variant?: TextVariant;
    /** @deprecated Use `variant`. */
    preset?: LegacyPreset;
    /** Defaults to the theme's text color. */
    color?: string;
    align?: TextStyle["textAlign"];
    weight?: FontWeight;
    mt?: number;
    mb?: number;
    ml?: number;
    mr?: number;
    children: React.ReactNode;
};

function AppText({
    variant,
    preset,
    color,
    align,
    weight,
    mt,
    mb,
    ml,
    mr,
    style,
    children,
    maxFontSizeMultiplier = MAX_FONT_SCALE,
    ...props
}: Props) {
    const theme = useTheme();
    const base = theme.typography[variant ?? (preset ? LEGACY_PRESETS[preset] : "bodySm")];

    const textStyle: StyleProp<TextStyle> = [
        base,
        weight && fontFor(weight, theme.fontsLoaded),
        {
            color: color ?? theme.colors.text,
            textAlign: align,
            marginTop: mt,
            marginBottom: mb,
            marginLeft: ml,
            marginRight: mr,
        },
        style,
    ];

    return (
        <Text {...props} maxFontSizeMultiplier={maxFontSizeMultiplier} style={textStyle}>
            {children}
        </Text>
    );
}

export default memo(AppText);
