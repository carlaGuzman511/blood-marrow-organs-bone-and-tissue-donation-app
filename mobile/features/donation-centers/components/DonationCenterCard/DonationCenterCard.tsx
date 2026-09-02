import React, { memo, useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import AppCard from "@/components/ui/AppCard";

import CardHeader from "@/components/ui/CardHeader";
import DonationCenterCardInfo from "../DonationCenterCardInfo";
import DonationCenterCardServices from "../DonationCenterCardServices";
import DonationCenterCardFooter from "../DonationCenterCardFooter";

import { DonationCenter } from "@/models/App.types";

import styles from "./DonationCenterCard.styles";

type Props = {
    item: DonationCenter;
};

function DonationCenterCard({ item }: Props) {
    console.log("DonationCenterCard rendered with item:", item);
    const router = useRouter();
    const handlePress = useCallback(() => {
        router.push({
            pathname: "/donation-centers/details",
            params: {
                id: item.id?.toString(),
            },
        });
    }, [item.id]);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.container}
            onPress={handlePress}
        >
            <AppCard style={styles.card}>
                <CardHeader
                    name={item.name}
                    city={item.city}
                    image={item.image}
                    isOpen={true}
                />
                <DonationCenterCardInfo
                    address={item.address}
                    phone={item.phone}
                    email={item.email}
                    openingHours={item.openingHours}
                />
                <DonationCenterCardServices
                    // TODO
                    // services={item.services ?? []}
                    services={[{ id: 1, name: "Kidneys" }, { id: 2, name: "Heart" }, { id: 3, name: "Liver" }]}
                />
                <DonationCenterCardFooter
                    isOpen={true}
                    // TODO
                    // distance={item.distance}
                    distance="2.3 km"
                    onPress={handlePress}
                />
            </AppCard>
        </TouchableOpacity>
    );
}

export default memo(DonationCenterCard);
