import React, { memo } from "react";
import { View } from "react-native";

import ServiceChip from "@/components/ui/ServiceChip";
import styles from "./styles/DonationCenterCardServices.styles";

export interface DonationService {
    id: number;
    name: string;
}

type Props = {
    services: string[];
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
                    // key={service.id}
                    // key={service.name}
                    label={service}
                />
            ))}
        </View>
    );
}

export default memo(DonationCenterCardServices);