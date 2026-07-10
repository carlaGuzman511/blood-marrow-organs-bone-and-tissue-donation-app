import React from "react";
import { View, Text } from "react-native";
import { BloodType } from "@/models/App.types";
import styles from "@/styles";

type Props = {
    bloodType: BloodType | undefined;
};

export default function BloodTypeBadge({ bloodType }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                🩸 {bloodType?.name ?? ""}
            </Text>
        </View>
    );
}
