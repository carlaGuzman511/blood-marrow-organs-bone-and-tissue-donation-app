import { makeStyles, MIN_TOUCH_TARGET } from "@/theme";

export const useStyles = makeStyles((t) => ({
    base: {
        minHeight: MIN_TOUCH_TARGET,
        paddingHorizontal: t.spacing.lg,
        paddingVertical: t.spacing.sm,
        borderRadius: t.radius.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: t.spacing.xs,
    },
    fullWidth: { alignSelf: "stretch" },
    pressed: { transform: [{ scale: 0.98 }] },

    primary: { backgroundColor: t.colors.primary },
    primaryPressed: { backgroundColor: t.colors.primaryPressed },
    primaryLabel: { color: t.colors.onPrimary },

    secondary: { backgroundColor: t.colors.secondarySoft },
    secondaryPressed: { backgroundColor: t.colors.secondary },
    secondaryLabel: { color: t.colors.secondaryText },
    secondaryLabelPressed: { color: t.colors.onSecondary },

    ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: t.colors.border },
    ghostPressed: { backgroundColor: t.colors.surfaceRecessed },
    ghostLabel: { color: t.colors.textMuted },

    disabled: { backgroundColor: t.colors.surfaceRecessed, borderColor: t.colors.surfaceRecessed },
    disabledLabel: { color: t.colors.textDisabled },
}));
