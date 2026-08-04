import React, { memo } from "react";
import { View } from "react-native";
import AppText from "@/components/ui/AppText";
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
  if (!services || services.length === 0) return null;

  return (
    <View style={styles.container}>
      {services.map((service) => (
        <View key={service.id} style={styles.chip}>
          <AppText preset="body4" style={styles.chipText}>
            {service.name}
          </AppText>
        </View>
      ))}
    </View>
  );    
    // return (
    //     <View style={styles.container}>
    //         {services.map(service => (
    //             <ServiceChip
    //                 // TODO
    //                 key={service.id}
    //                 label={service.name}
    //             />
    //         ))}
    //     </View>
    // );
}

export default memo(DonationCenterCardServices);
