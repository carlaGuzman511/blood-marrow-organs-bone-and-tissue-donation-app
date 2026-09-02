import React from 'react'
import { User } from '@/models/App.types';
import { useRouter } from 'expo-router';
import { View, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';
import CardHeader from '@/components/ui/CardHeader';
import AppText from '@/components/ui/AppText';
import styles from './UserCard.styles';
import { COLORS } from '@/constants';

type Props = {
    item: User
}

const UserCard = ({item}: Props) => {
    const router = useRouter();

    const handlePress = () => {
        router.push({
            pathname: '/donors/details',
            params: {
                id: item.id?.toString(),
            },
        });
    }

    return(
        <TouchableOpacity 
            onPress={handlePress} 
            key={item.id?.toString()} 
            style={styles.touchable} 
            activeOpacity={0.9}
            >
            <AppCard style={styles.card}>
                <CardHeader
                    name={item.fullName}
                    city={item.address || 'Unknown location'}
                    image={item.image || ''}
                    isOpen={true}
                />
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons 
                            name='blood-bag' 
                            size={18} 
                            color={COLORS.primary}
                        />
                        <AppText preset="body4" style={styles.infoText}>
                            {item.bloodType.name}
                        </AppText>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons 
                            name='call-outline' 
                            size={18} 
                            color={COLORS.primary}
                        />
                        <AppText preset="body4" style={styles.infoText}>
                            {item.phoneNumber || 'Not provided'}
                        </AppText>
                    </View>
                </View>
            </AppCard>
        </TouchableOpacity>
    );
};

export default UserCard;