import React, { memo, useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import AppCard from "@/components/ui/AppCard";

import DonationCenterCardHeader from "../DonationCenterCardHeader";
import DonationCenterCardInfo from "../DonationCenterCardInfo";
import DonationCenterCardServices from "../DonationCenterCardServices";
import DonationCenterCardFooter from "../DonationCenterCardFooter";

import { DonationCenter } from "@/models/App.types";

import styles from "./DonationCenterCard.styles";

type Props = {
    item: DonationCenter;
};

function DonationCenterCard({ item }: Props) {
    const router = useRouter();
    const handlePress = useCallback(() => {
        router.push({
            pathname: "/search/donation-center-details",
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
            <AppCard>
                <DonationCenterCardHeader
                    name={item.name}
                    city={item.city}
                    image={item.image}
                />
                <DonationCenterCardInfo
                    address={item.address}
                    // TODO
                    // phone={item.phone}
                />
                <DonationCenterCardServices
                    // TODO
                    // services={item.services ?? []}
                    services={["Kidneys", "Heart", "Liver"]}
                />
                <DonationCenterCardFooter
                    isOpen={true}
                    // TODO
                    // distance={item.distance}
                    distance="2.3 km"
                />
            </AppCard>
        </TouchableOpacity>
    );
}

export default memo(DonationCenterCard);