import { makeStyles } from "@/theme";

export const INPUT_HEIGHT = 52;

export const useStyles = makeStyles((t) => ({
    container: { marginBottom: t.spacing.md, gap: t.spacing.xs },
    field: {
        minHeight: INPUT_HEIGHT,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: t.colors.inputBackground,
        paddingHorizontal: t.spacing.md,
        justifyContent: "center",
    },
    // 2px outline + soft blue glow; 1px less padding so the text doesn't move.
    focused: {
        borderWidth: 2,
        borderColor: t.colors.focus,
        backgroundColor: t.colors.inputBackgroundFocused,
        paddingHorizontal: t.spacing.md - 1,
        shadowColor: t.colors.focus,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    invalid: { borderColor: t.colors.error },
    input: {
        ...t.typography.bodyMd,
        color: t.colors.text,
        paddingVertical: t.spacing.sm,
    },
    multiline: { minHeight: 120, textAlignVertical: "top" },
}));
