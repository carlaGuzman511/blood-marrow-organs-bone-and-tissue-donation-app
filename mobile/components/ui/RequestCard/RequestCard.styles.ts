import { makeStyles } from "@/theme";

export const useStyles = makeStyles((t) => ({
    accent: { height: 4 },
    body: { padding: t.spacing.md, gap: t.spacing.sm },
    summary: { gap: t.spacing.sm },
    header: { flexDirection: "row", alignItems: "flex-start", gap: t.spacing.sm },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: t.radius.md,
        backgroundColor: t.colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    titles: { flex: 1, minWidth: 0, gap: 2 },
    centerText: { flexShrink: 1 },
    centerRow: { flexDirection: "row", alignItems: "center", gap: t.spacing["2xs"] },
    side: { alignItems: "flex-end", gap: t.spacing["2xs"] },
    chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: t.spacing["2xs"] },
    description: {
        backgroundColor: t.colors.background,
        borderRadius: t.radius.md,
        padding: t.spacing.sm,
    },
    progressLabels: { flexDirection: "row", justifyContent: "space-between" },
    track: {
        height: 4,
        borderRadius: t.radius.full,
        backgroundColor: t.colors.surfaceRecessed,
        overflow: "hidden",
        marginTop: t.spacing["2xs"],
    },
    fill: { height: "100%", borderRadius: t.radius.full, backgroundColor: t.colors.primary },
    actions: { flexDirection: "row", alignItems: "center", gap: t.spacing.xs },
    donate: { flex: 1 },
}));
