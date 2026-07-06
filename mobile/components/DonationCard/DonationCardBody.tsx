import React from "react";
import { View, Text } from "react-native";
import UserAvatar from "../Avatar/UserAvatar";
import styles from "./DonationCard.styles";
import { DonationPost } from "@/models/App.types";

type Props = {
    item: DonationPost;
};

export default function DonationCardBody({ item }: Props) {

    return (
        <View style={styles.body}>
            <UserAvatar image={item.user?.image} />
            <View style={styles.info}>
                <Text
                    numberOfLines={1}
                    style={styles.title}
                >
                    TODO: TITLE
                    {/* {item.title} */}
                </Text>
                <Text
                    style={styles.subtitle}
                >
                    {item.user?.fullName}
                </Text>
                <Text
                    style={styles.location}
                >
                    📍 {item.donationCenter?.address}
                </Text>
                <Text
                    numberOfLines={2}
                    style={styles.description}
                >
                    {item.description}
                </Text>
            </View>
        </View>
    );
}