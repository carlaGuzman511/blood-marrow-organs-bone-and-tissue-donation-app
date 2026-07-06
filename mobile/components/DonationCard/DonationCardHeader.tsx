import React from "react";
import { View, Text } from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import BloodTypeBadge from "../Badge/BloodTypeBadge";

import styles from "./DonationCard.styles";
import { DonationPost } from "@/models/App.types";

dayjs.extend(relativeTime);

type Props = {
    item: DonationPost;
};

export default function DonationCardHeader({ item }: Props) {

    return (
        <View style={styles.header}>
            <BloodTypeBadge bloodType={item.bloodType} />
            <Text style={styles.time}>
                {dayjs(item.createdAt).fromNow()}
            </Text>
        </View>
    );
}