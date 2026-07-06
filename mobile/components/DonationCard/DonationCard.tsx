import React, { memo } from "react";
import { View } from "react-native";

import { DonationPost } from "@/models/App.types";

import Header from "./DonationCardHeader";
import Body from "./DonationCardBody";
import Footer from "./DonationCardFooter";

import styles from "./DonationCard.styles";

type Props = {
    item: DonationPost;
    onPress: () => void;
};

function DonationCard({ item, onPress }: Props) {

    return (
        <View style={styles.card}>
            <Header item={item} />
            <Body item={item} />
            <Footer onPress={onPress} />
        </View>
    );

}

export default memo(DonationCard);