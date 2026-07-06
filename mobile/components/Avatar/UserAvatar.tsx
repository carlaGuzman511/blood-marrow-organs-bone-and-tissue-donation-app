import React, { memo } from "react";
import { Image } from "react-native";
import styles from "../DonationCard/DonationCard.styles";

type Props = {
    image: string | undefined;
};

function UserAvatar({ image }: Props) {
    return (
        <Image

            source={{ uri: image }}
            style={styles.avatar}
        />
    );
}

export default memo(UserAvatar);