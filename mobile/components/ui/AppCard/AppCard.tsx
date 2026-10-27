import React, { memo } from "react";
import { View, ViewProps } from "react-native";

import { ElevationLevel, makeStyles } from "@/theme";

type Props = ViewProps & {
    /** DESIGN.md elevation: 1 resting card (default), 2 active alert, 3 sheet. */
    elevation?: ElevationLevel;
    /** Removes the inner padding (for edge-to-edge images or accent bars). */
    flush?: boolean;
    children: React.ReactNode;
};

const useStyles = makeStyles((t) => ({
    card: {
        backgroundColor: t.colors.surface,
        borderRadius: t.radius.card,
        borderWidth: 1,
        borderColor: t.colors.borderSubtle,
        padding: t.spacing.md,
    },
    flush: { padding: 0, overflow: "hidden" },
    level0: { ...t.elevation[0], backgroundColor: t.colors.background },
    level1: t.elevation[1],
    level2: t.elevation[2],
    level3: t.elevation[3],
}));

function AppCard({ elevation = 1, flush = false, children, style, ...props }: Props) {
    const styles = useStyles();
    const level = [styles.level0, styles.level1, styles.level2, styles.level3][elevation];

    return (
        <View {...props} style={[styles.card, level, flush && styles.flush, style]}>
            {children}
        </View>
    );
}

export default memo(AppCard);
