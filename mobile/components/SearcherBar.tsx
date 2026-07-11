
import { View, TouchableOpacity, TextInput, Text } from 'react-native'
import React from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import styles from './SearcherBar.styles';

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
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={24} color={COLORS.black} />
                <TextInput style={styles.input} placeholder='Search' value={search} onChangeText={handleSearch} />
                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
            {filterGroups?.map((group) => (
                <View key={group.title} style={styles.container}>
                    <Text style={styles.filterLabel}>{group.title}</Text>
                    <View style={styles.filtersRow}>
                        {group.options.map((option) => {
                            const isSelected = group.selected === option;
                            return (
                                <TouchableOpacity
                                    key={`${group.title}-${option}`}
                                    onPress={() => group.onSelect(isSelected ? '' : option)}
                                    style={[styles.filterOption, isSelected && styles.filterOptionSelected]}
                                >
                                    <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}>{option}</Text>
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