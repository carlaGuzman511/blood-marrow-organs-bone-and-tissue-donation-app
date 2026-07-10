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
        isLoading,
        error,
    } = useUsers();

    const filteredUsers = useMemo(() => {
    return users.filter((user: User) => {
            const byName = user.fullName.toLowerCase().includes(search.toLowerCase());
            const byBloodType = bloodTypeFilter ? user.bloodTypeId === bloodTypeFilter : true;
            const byLocation = locationFilter ? user.address.toLowerCase().includes(locationFilter.toLowerCase()) : true;
            
            return byName && byBloodType && byLocation;
        });
    }, [users, search, bloodTypeFilter, locationFilter]);

    const renderUsersList = () => {
        return(
            <FlatList
                data={filteredUsers}
                renderItem={(item: any) => (<UserCard item={item.item}/>)}
                keyExtractor={(item: User) => item.id?.toString()}
                contentContainerStyle={{
                    flexGrow: 1,
                }}
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
        <SafeAreaView
            style={{
                flex:1
            }}
        >
            <View
                style={{
                    marginHorizontal:22,
                    flex:1,
                }}
            >
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