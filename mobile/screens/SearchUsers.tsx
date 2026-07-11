import { View } from 'react-native'
import React, { useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import SearcherBar from '@/components/SearcherBar';
import UserCard from '@/components/UserCard';
import { User } from '@/models/App.types';
import { useUsers } from '@/hooks/useUsers';
import styles from './SearchUsers.styles';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const locationFilters = ['Cochabamba', 'Santa Cruz', 'Tarija', 'La Paz', 'Oruro', 'Potosi', 'Beni', 'Pando'];

const SearchUsers = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [bloodTypeFilter, setBloodTypeFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    const handleSearch = (text: string) => {
        setSearch(text);
    }

    const {
        data: users = [],
    } = useUsers();

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const byName = u.fullName.toLowerCase().includes(search.toLowerCase());
            const byBloodType = bloodTypeFilter ? u.bloodTypeId === bloodTypeFilter : true;
            const byLocation = locationFilter ? u.address.toLowerCase().includes(locationFilter.toLowerCase()) : true;
            return byName && byBloodType && byLocation;
        });
    }, [users, search, bloodTypeFilter, locationFilter]);

    const renderUsersList = () => {
        return(
            <FlatList
                data={filteredUsers}
                renderItem={(item: any) => (<UserCard item={item.item}/>)}
                keyExtractor={(item: User) => item.id?.toString()}
                contentContainerStyle={styles.listContent}
                onEndReached={() => {}}
                onEndReachedThreshold={0.2}
                showsVerticalScrollIndicator={false}
            />
        );
    }

    const onPressHeader = () => {
        router.back();
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Header
                    name='Search Donors'
                    onPress={onPressHeader}
                />
                <SearcherBar
                    search={search}
                    handleSearch={handleSearch}
                    filterGroups={[
                        {
                            title: 'Blood Type',
                            options: bloodTypes,
                            selected: bloodTypeFilter,
                            onSelect: setBloodTypeFilter,
                        },
                        {
                            title: 'Location',
                            options: locationFilters,
                            selected: locationFilter,
                            onSelect: setLocationFilter,
                        },
                    ]}
                />
                {renderUsersList()}
            </View>
        </SafeAreaView>
    )
}

export default SearchUsers;