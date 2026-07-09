import React, { memo } from "react";
import { View } from "react-native";

import AppText from "../AppText";

import styles from "./Badge.styles";

type Props = {
    label: string;
    backgroundColor: string;
    textColor: string;
};

function Badge({
    label,
    backgroundColor,
    textColor,
}: Props) {

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor,
                },
            ]}
        >
            <AppText
                preset="body4"
                color={textColor}
            >
                {label}
            </AppText>
        </View>
    );
}

export default memo(Badge);