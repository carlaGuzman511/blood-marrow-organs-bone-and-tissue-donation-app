import React, { memo } from "react";
import { View } from "react-native";

import { makeStyles, useTheme } from "@/theme";
import { spokenBloodType } from "@/utils/spokenBloodType";
import AppText from "../AppText";

type Props = {
    /** Blood group as the API names it, e.g. "O-" or "AB+". */
    label: string;
    /** sm: pill for lists and filters. md: 32x32 squircle for cards (DESIGN.md "Blood Badges"). */
    size?: "sm" | "md";
};

const useStyles = makeStyles((t) => ({
    base: {
        backgroundColor: t.colors.bloodBadge.background,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
    },
    sm: { minHeight: 24, paddingHorizontal: t.spacing.xs, borderRadius: t.radius.full },
    md: { minWidth: 32, minHeight: 32, paddingHorizontal: t.spacing["2xs"] + 2, borderRadius: t.radius.base },
}));

function BloodTypeChip({ label, size = "sm" }: Props) {
    const styles = useStyles();
    const { colors } = useTheme();

    return (
        <View
            style={[styles.base, styles[size]]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Grupo sanguíneo ${spokenBloodType(label)}`}
        >
            <AppText variant={size === "md" ? "labelMd" : "badge"} weight="800" color={colors.bloodBadge.foreground}>
                {label}
            </AppText>
        </View>
    );
}

export default memo(BloodTypeChip);
