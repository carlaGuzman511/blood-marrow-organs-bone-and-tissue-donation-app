import React from 'react'
import { DonationCenter } from '@/models/App.types';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { COLORS } from '@/constants';
import { EvilIcons } from '@expo/vector-icons';
import styles from './DonationCenterCard.styles';

type Props = {
    item: DonationCenter
}

const DonationCenterCard = ({ item }: Props) => {
    const router = useRouter();

    const handlePress = () => {
        router.push({
            pathname: '/search/donation-center-details',
            params: {
                id: item.id?.toString(),
            },
        });
    };

    return(
        <SafeAreaView>
            <TouchableOpacity onPress={handlePress} key={item.id?.toString()} style={styles.container}>
                <Image source={{uri: item.image}} resizeMode='contain' style={styles.image} />
                <View style={styles.content}>
                    <Text style={styles.nameText}>{item.name}</Text>
                    <View style={styles.addressRow}>
                        <EvilIcons name='location' size={24} color={COLORS.primary} />
                        <Text style={styles.addressText}>{item.address}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={styles.cityText}>{item.city}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default DonationCenterCard;