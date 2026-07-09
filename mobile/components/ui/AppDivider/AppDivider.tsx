import React, { memo } from "react";
import { View } from "react-native";

import styles from "./AppDivider.styles";

type Props = {
    marginVertical?: number;
};

function AppDivider({
    marginVertical = 16,
}: Props) {
    return (
        <View
            style={[
                styles.divider,
                {
                    marginVertical,
                },
            ]}
        />
    );
}

export default memo(AppDivider);