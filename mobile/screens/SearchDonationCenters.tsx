import { View } from 'react-native'
import React, { useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import SearcherBar from '@/components/SearcherBar';
import { DonationCenter } from '@/models/App.types';
import DonationCenterCard from '@/features/donation-centers/components/DonationCenterCard';
import { useDonationCenters } from '@/features/donation-centers/hooks/useDonationCenters';
import styles from './SearchDonationCenters.styles';

const cityFilters = ['Dhaka', 'Chittagong', 'Mirpur', 'Lakshimpur'];
const serviceFilters = ['Blood Donation', 'Plasma Donation', 'Platelet Donation'];

const SearchDonationCenters = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');

    const handleSearch = (text: string) => {
        setSearch(text);
    }

    const {
        data: donationCenters = [],
    } = useDonationCenters();

    const filteredDonationCenters = useMemo(() => {
        return donationCenters.filter((dc) => {
            const byName = dc.name.toLowerCase().includes(search.toLowerCase());
            const byCity = cityFilter ? dc.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
            const byService = serviceFilter ?
                dc.donationTypes?.some((type) => type.name.toLowerCase() === serviceFilter.toLowerCase()) ||
                dc.name.toLowerCase().includes(serviceFilter.toLowerCase()) ||
                dc.address.toLowerCase().includes(serviceFilter.toLowerCase())
                : true;
            return byName && byCity && byService;
        });
    }, [donationCenters, search, cityFilter, serviceFilter]);

    const renderDonationCentersList = () => {
        return(
            <FlatList
                data={filteredDonationCenters}
                renderItem={(item: any) => (<DonationCenterCard item={item.item}/>)}
                keyExtractor={(item: DonationCenter) => item.id?.toString()}
                contentContainerStyle={styles.listContent}
            />
        );
    }

    const onPressHeader = () => {
        router.back();
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Header name='Search Centers' onPress={onPressHeader} />
                <SearcherBar
                    search={search}
                    handleSearch={handleSearch}
                    filterGroups={[
                        {
                            title: 'City',
                            options: cityFilters,
                            selected: cityFilter,
                            onSelect: setCityFilter,
                        },
                        {
                            title: 'Service',
                            options: serviceFilters,
                            selected: serviceFilter,
                            onSelect: setServiceFilter,
                        },
                    ]}
                />
                {renderDonationCentersList()}
            </View>
        </SafeAreaView>
    )
}

export default SearchDonationCenters;