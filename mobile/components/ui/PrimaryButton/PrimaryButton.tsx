import React from "react";
import AppButton from "../AppButton";
import styles from "./PrimaryButton.styles";

type Props = {
    title: string;
    onPress: () => void;
};

/** @deprecated Use `AppButton` (variant="primary"). Kept so existing screens get the new button. */
export default function PrimaryButton({ title, onPress }: Props) {
    return <AppButton title={title} onPress={onPress} style={styles.button} />;
}
