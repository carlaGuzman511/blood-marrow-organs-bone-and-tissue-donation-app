import React, { memo } from "react";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ClinicalTone, makeStyles, useTheme } from "@/theme";
import AppText from "../AppText";
import type { IconName } from "../AppButton";

type Props = {
    /** urgent: red. observation: amber. viable/confirmed: green. info: blue. neutral: grey. */
    tone: ClinicalTone;
    label: string;
    /** Overrides the tone's icon. Color is never the only signal: there is always an icon and text. */
    icon?: IconName;
};

const TONE_ICONS: Record<ClinicalTone, IconName> = {
    urgent: "priority-high",
    observation: "visibility",
    viable: "check-circle",
    info: "info-outline",
    neutral: "schedule",
};

const useStyles = makeStyles((t) => ({
    container: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: t.spacing["2xs"],
        minHeight: 24,
        paddingHorizontal: t.spacing.xs + 2,
        borderRadius: t.radius.full,
    },
}));

function StatusBadge({ tone, label, icon }: Props) {
    const styles = useStyles();
    const { colors } = useTheme();
    const { background, foreground } = colors.tones[tone];

    return (
        <View
            style={[styles.container, { backgroundColor: background }]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={label}
        >
            <MaterialIcons name={icon ?? TONE_ICONS[tone]} size={14} color={foreground} />
            <AppText variant="labelSm" color={foreground}>
                {label}
            </AppText>
        </View>
    );
}

export default memo(StatusBadge);
