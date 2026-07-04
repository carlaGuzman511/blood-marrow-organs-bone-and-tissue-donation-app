import { View } from 'react-native'
import React, { useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList } from 'react-native-gesture-handler';
import Header from '@/components/Header';
import SearcherBar from '@/components/SearcherBar';
import UserCard from '@/components/UserCard';
import { User } from '@/models/App.types';
import { useUsers } from '@/hooks/useUsers';

const SearchUsers = () => {
    const [search, setSearch] = useState('');
    const handleSearch = (text: string) => {
        setSearch(text);
    }

    const {
        data: users = [],
        isLoading,
        error,
    } = useUsers();

    const filteredUsers = useMemo(() => {

        return users.filter(u =>
            u.fullName
            .toLowerCase()
            .includes(search.toLowerCase())
        );

    }, [users, search]);

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
                {<SearcherBar search={search} handleSearch={handleSearchUsersByName}/>}
                {renderUsersList()}
            </View>
        </SafeAreaView>
    )
}

export default SearchUsers;