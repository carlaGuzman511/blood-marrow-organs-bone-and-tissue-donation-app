import React, { memo } from "react";
import {
    Text,
    TextProps,
    StyleProp,
    TextStyle,
} from "react-native";

import { COLORS, FONTS } from "@/constants";

type FontPreset = keyof typeof FONTS;

type Props = TextProps & {
    preset?: FontPreset;
    color?: string;
    align?: TextStyle["textAlign"];
    weight?: TextStyle["fontWeight"];
    mt?: number;
    mb?: number;
    ml?: number;
    mr?: number;
    children: React.ReactNode;
};

function AppText({
    preset = "body4",
    color = COLORS.black,
    align,
    weight,
    mt,
    mb,
    ml,
    mr,
    style,
    children,
    ...props

}: Props) {
    const textStyle: StyleProp<TextStyle> = [
        FONTS[preset],
        {
            color,
            textAlign: align,
            fontWeight: weight,
            marginTop: mt,
            marginBottom: mb,
            marginLeft: ml,
            marginRight: mr,
        },
        style,
    ];

    return (
        <Text
            {...props}
            style={textStyle}
        >
            {children}
        </Text>
    );
}

export default memo(AppText);