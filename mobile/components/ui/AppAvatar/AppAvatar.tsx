import React, { memo } from "react";
import {
    Image,
    View,
} from "react-native";

import AppText from "../AppText";

import styles from "./AppAvatar.styles";

type Props = {
    uri?: string;
    size?: number;
    fallbackText?: string;
};

function AppAvatar({
    uri,
    size = 64,
    fallbackText,
}: Props) {
    if (!uri) {
        return (
            <View
                style={[
                    styles.placeholder,
                    styles.avatar
                ]}
            >
                <AppText
                    preset="h3"
                >
                    {fallbackText?.charAt(0).toUpperCase()}
                </AppText>
            </View>
        );
    }

    return (
        <Image
            source={{ uri }}
            style={styles.avatar}
        />
    );
}

export default memo(AppAvatar);