import React, { memo, useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { DonationCenter } from "@/models/App.types";

import AppCard from "@/components/ui/AppCard";

import DonationCenterCardHeader from "../../donation-centers/components/DonationCenterCard/DonationCenterCardHeader";
import DonationCenterCardInfo from "../../donation-centers/components/DonationCenterCard/DonationCenterCardInfo";
import DonationCenterCardServices from "../../donation-centers/components/DonationCenterCard/DonationCenterCardServices";
import DonationCenterCardFooter from "../../donation-centers/components/DonationCenterCardFooter/DonationCenterCardFooter";

type Props = {
    item: DonationCenter;
};

function DonationCenterCard({ item }: Props) {
    const router = useRouter();
    const handlePress = useCallback(() => {
        router.push({
            pathname: "/search/donation-center-details",
            params: {
                id: item.id
            }
        });

    }, [item.id]);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
        >
            <AppCard>
                <DonationCenterCardHeader
                    name={item.name}
                    city={item.city}
                    image={item.image}
                    isOpen={false}
                    // TODO
                    // isOpen={item.isOpen}
                />
                <DonationCenterCardInfo
                    // TODO
                    // phone={item.phone}
                    // email={item.email}
                    // openingHours={item.openingHours}
                    address={item.address}
                    phone="+1 (555) 123-4567"
                    email="hospital.viedma@gmail.com"
                    openingHours="08:00 - 17:00"
                />
                <DonationCenterCardServices
                    //TODO
                    //services={item.services}
                    services={["Blood Donation", "Plasma Donation", "Platelet Donation"]}
                />
                <DonationCenterCardFooter
                    //TODO
                    // isOpen={item.isOpen}
                    // openingHours={item.openingHours}
                    // distance={item.distance}
                    isOpen={false}
                    openingHours="08:00 - 17:00"
                    distance="2.5 km"
                    onPress={handlePress}
                />
            </AppCard>
        </TouchableOpacity>
    );
}

export default memo(DonationCenterCard);