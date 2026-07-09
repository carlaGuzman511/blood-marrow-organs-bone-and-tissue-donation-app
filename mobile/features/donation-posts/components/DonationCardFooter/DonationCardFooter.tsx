import React from "react";
import { View } from "react-native";
import PrimaryButton from "../../../../components/Buttons/PrimaryButton";
import styles from "./DonationCardFooter.styles";

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