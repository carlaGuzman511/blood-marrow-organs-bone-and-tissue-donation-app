import { View } from 'react-native'
import React, { useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList } from 'react-native-gesture-handler';
import Header from '@/components/Header';
import SearcherBar from '@/components/SearcherBar';
import { DonationCenter } from '@/models/App.types';
import DonationCenterCard from '@/components/DonationCenterCard';
import { useSearchContext } from '@/app/search/context';
import { useDonationCenters } from '@/hooks/useDonationCenters';

const SearchDonationCenters = () => {
    const [search, setSearch] = useState('');
    const [state, actions] = useSearchContext();

    const handleSearch = (text: string) => {
        setSearch(text);
    }

    const {
        data: donationCenters = [],
        isLoading,
        error,
    } = useDonationCenters();

    const filteredDonationCenters = useMemo(() => {

        return donationCenters.filter(dc =>
            dc.name
            .toLowerCase()
            .includes(search.toLowerCase())
        );

    }, [donationCenters, search]);

    const renderDonationCentersList = () => {
        return(
            <FlatList
                data={filteredDonationCenters}
                renderItem={(item: any) => (<DonationCenterCard item={item.item}/>)}
                keyExtractor={(item: DonationCenter) => item.id?.toString()}
                contentContainerStyle={{
                    flexGrow: 1,
                }}
            />
        );
    }

    const onPressHeader = () => {
        // navigation.navigate('Home');
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
                    name='Search'
                    onPress={onPressHeader}
                />
                {<SearcherBar search={search} handleSearch={handleSearch}/>}
                {renderDonationCentersList()}
            </View>
        </SafeAreaView>
    )
}

export default SearchDonationCenters;