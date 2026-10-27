import React, { memo, useEffect, useRef } from "react";
import { Animated, View } from "react-native";

import { useReduceMotion } from "@/hooks/useReduceMotion";
import { makeStyles, useTheme } from "@/theme";
import AppText from "../AppText";

type Props = {
    /** e.g. "3 solicitudes urgentes a menos de 15 km". */
    message: string;
    /** Short trailing detail, e.g. "En vivo". */
    detail?: string;
};

const DOT = 10;

const useStyles = makeStyles((t) => ({
    capsule: {
        flexDirection: "row",
        alignItems: "center",
        gap: t.spacing.xs,
        minHeight: 40,
        paddingHorizontal: t.spacing.md,
        borderRadius: t.radius.full,
        backgroundColor: t.colors.surface,
        borderWidth: 1,
        borderColor: t.colors.borderSubtle,
        ...t.elevation[1],
    },
    dotBox: { width: DOT, height: DOT, alignItems: "center", justifyContent: "center" },
    dot: { width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: t.colors.success },
    halo: { position: "absolute", width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: t.colors.success },
    message: { flex: 1 },
}));

/** DESIGN.md "Live Pulse Banner": slim capsule with a pulsing emerald dot. */
function LivePulseBanner({ message, detail }: Props) {
    const styles = useStyles();
    const { colors } = useTheme();
    const reduceMotion = useReduceMotion();
    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (reduceMotion) {
            pulse.setValue(0);
            return;
        }
        const loop = Animated.loop(
            Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        );
        loop.start();
        return () => loop.stop();
    }, [pulse, reduceMotion]);

    const halo = {
        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
    };

    return (
        <View
            style={styles.capsule}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={detail ? `${detail}: ${message}` : message}
        >
            <View style={styles.dotBox}>
                {!reduceMotion && <Animated.View testID="pulse-halo" style={[styles.halo, halo]} />}
                <View style={styles.dot} />
            </View>
            <AppText variant="labelMd" numberOfLines={1} style={styles.message}>
                {message}
            </AppText>
            {detail ? (
                <AppText variant="labelSm" color={colors.tones.viable.foreground}>
                    {detail}
                </AppText>
            ) : null}
        </View>
    );
}

export default memo(LivePulseBanner);
