
import { View, TouchableOpacity, TextInput, Text } from 'react-native'
import React from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '@/constants';

type FilterGroup = {
    title: string,
    options: string[],
    selected: string,
    onSelect: (value: string) => void
}

type Props = {
    search: string,
    handleSearch: (data: string) => void,
    filterGroups?: FilterGroup[]
}

const SearcherBar = ({search, handleSearch, filterGroups}: Props) => {
    const handleClear = () => {
        handleSearch('');
    }

    return(
        <View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems:'center',
                    backgroundColor:COLORS.secondaryWhite,
                    height:48,
                    marginVertical:22,
                    paddingHorizontal:22,
                    borderRadius:4
                }}
            >
                <Ionicons
                    name="search-outline"
                    size={24}
                    color={COLORS.black}
                />
                <TextInput
                    style={{
                        height:'100%',
                        marginHorizontal:12,
                        width:SIZES.width - 144
                    }}
                    placeholder='Search'
                    value={search}
                    onChangeText={handleSearch}
                />
                <TouchableOpacity
                    style={{
                        height:48,
                        width:48,
                        borderRadius:8,
                        alignItems:'center',
                        justifyContent:'center',
                        backgroundColor:COLORS.primary
                    }}
                    onPress={handleClear}
                >
                    <MaterialCommunityIcons
                        name="close"
                        size={24}
                        color={COLORS.white}
                    />
                </TouchableOpacity>
            </View>
            {filterGroups?.map((group) => (
                <View
                    key={group.title}
                    style={{
                        marginBottom: 12,
                    }}
                >
                    <Text
                        style={{
                            ...FONTS.body4,
                            color: COLORS.gray,
                            marginBottom: 8,
                        }}
                    >
                        {group.title}
                    </Text>
                    <View
                        style={{
                            flexDirection:'row',
                            flexWrap:'wrap',
                            gap:8,
                        }}
                    >
                        {group.options.map((option) => {
                            const isSelected = group.selected === option;
                            return (
                                <TouchableOpacity
                                    key={`${group.title}-${option}`}
                                    onPress={() => group.onSelect(isSelected ? '' : option)}
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 14,
                                        borderRadius: 24,
                                        backgroundColor: isSelected ? COLORS.primary : COLORS.secondaryWhite,
                                        borderWidth: 1,
                                        borderColor: isSelected ? COLORS.primary : COLORS.border,
                                    }}
                                >
                                    <Text
                                        style={{
                                            ...FONTS.body4,
                                            color: isSelected ? COLORS.white : COLORS.black,
                                        }}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            ))}
        </View>
    );
}

export default SearcherBar;