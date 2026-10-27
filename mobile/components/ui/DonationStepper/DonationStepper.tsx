import React, { memo } from "react";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { makeStyles, useTheme } from "@/theme";
import AppText from "../AppText";

/** The life cycle of donated blood (DESIGN.md "Donation Journey Stepper"). */
export const DONATION_STEPS = ["Recolectada", "Analizada", "Almacenada", "Transfundida"];

type Props = {
    /** Index of the current step (0-based). Steps before it are done. */
    current: number;
    steps?: string[];
};

const NODE = 24;

const useStyles = makeStyles((t) => ({
    row: { flexDirection: "row", alignItems: "flex-start" },
    step: { flex: 1, alignItems: "center", gap: t.spacing.xs },
    track: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", height: NODE },
    line: { flex: 1, height: 2, backgroundColor: t.colors.border },
    lineDone: { backgroundColor: t.colors.focus },
    hidden: { backgroundColor: "transparent" },
    node: {
        width: NODE,
        height: NODE,
        borderRadius: NODE / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surface,
    },
    done: { backgroundColor: t.colors.focus, borderColor: t.colors.focus },
    // The "glowing" current node.
    current: {
        backgroundColor: t.colors.primary,
        borderColor: t.colors.primarySoft,
        shadowColor: t.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 3,
    },
    label: { textAlign: "center" },
}));

function DonationStepper({ current, steps = DONATION_STEPS }: Props) {
    const styles = useStyles();
    const { colors } = useTheme();
    const index = Math.max(0, Math.min(current, steps.length - 1));

    return (
        <View
            style={styles.row}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Paso ${index + 1} de ${steps.length}: ${steps[index]}`}
            accessibilityValue={{ min: 1, max: steps.length, now: index + 1, text: steps[index] }}
        >
            {steps.map((step, i) => {
                const state = i < index ? "done" : i === index ? "current" : "todo";
                return (
                    <View key={step} style={styles.step}>
                        <View style={styles.track}>
                            <View style={[styles.line, i === 0 && styles.hidden, i <= index && styles.lineDone]} />
                            <View style={[styles.node, state === "done" && styles.done, state === "current" && styles.current]}>
                                {state === "done" ? <MaterialIcons name="check" size={14} color={colors.onPrimary} /> : null}
                            </View>
                            <View style={[styles.line, i === steps.length - 1 && styles.hidden, i < index && styles.lineDone]} />
                        </View>
                        <AppText
                            variant="labelSm"
                            color={state === "todo" ? colors.textMuted : colors.text}
                            style={styles.label}
                        >
                            {step}
                        </AppText>
                    </View>
                );
            })}
        </View>
    );
}

export default memo(DonationStepper);
