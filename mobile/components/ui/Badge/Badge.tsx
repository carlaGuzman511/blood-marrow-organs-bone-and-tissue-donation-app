import React, { memo } from "react";
import { View } from "react-native";

import { makeStyles } from "@/theme";
import AppText from "../AppText";

type Props = {
    label: string;
    backgroundColor: string;
    textColor: string;
};

const useStyles = makeStyles((t) => ({
    container: {
        paddingHorizontal: t.spacing.sm,
        minHeight: 24,
        justifyContent: "center",
        borderRadius: t.radius.full,
        alignSelf: "flex-start",
    },
}));

/** Plain pill. For clinical states use `StatusBadge`, for blood groups `BloodTypeChip`. */
function Badge({ label, backgroundColor, textColor }: Props) {
    const styles = useStyles();
    return (
        <View style={[styles.container, { backgroundColor }]}>
            <AppText variant="labelSm" color={textColor}>
                {label}
            </AppText>
        </View>
    );
}

export default memo(Badge);
