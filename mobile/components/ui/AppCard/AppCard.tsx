import React, { memo } from "react";
import {
    View,
    ViewProps,
} from "react-native";

import styles from "./AppCard.styles";

type Props = ViewProps & {
    children: React.ReactNode;
};

function AppCard({
    children,
    style,
    ...props
}: Props) {
    return (
        <View
            {...props}
            style={[styles.card, style]}
        >
            {children}
        </View>
    );
}

export default memo(AppCard);