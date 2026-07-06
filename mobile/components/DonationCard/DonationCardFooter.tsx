import React from "react";
import { View } from "react-native";
import PrimaryButton from "../Buttons/PrimaryButton";
import styles from "./DonationCard.styles";

type Props = {
    onPress: () => void;
};

export default function DonationCardFooter({ onPress }: Props) {
    return (
        <View style={styles.footer}>
            <PrimaryButton
                title="Donate"
                onPress={onPress}
            />
        </View>
    );
}