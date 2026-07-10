import React, { memo } from "react";
import { View } from "react-native";

import ServiceChip from "@/components/ui/ServiceChip";
import styles from "./DonationCenterCardServices.styles";

export interface DonationService {
    id: number;
    name: string;
}

type Props = {
    services: DonationService[];
};

function DonationCenterCardServices({
    services,
}: Props) {
    if (!services.length) {
        return null;
    }
    
    return (
        <View style={styles.container}>
            {services.map(service => (
                <ServiceChip
                    // TODO
                    key={service.id}
                    label={service.name}
                />
            ))}
        </View>
    );
}

export default memo(DonationCenterCardServices);