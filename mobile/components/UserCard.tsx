import React from 'react'
import { User } from '@/models/App.types';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { COLORS, FONTS } from '@/constants';
import { MaterialCommunityIcons,EvilIcons } from '@expo/vector-icons';

type Props = {
    item: User
}

const UserCard = ({item}: Props) => {
    const router = useRouter();

    const handlePress = () => {
        router.push({
            pathname: '/search/donor-details',
            params: {
                id: item.id?.toString(),
            },
        });
    }

    return(
        <SafeAreaView>
            <TouchableOpacity
                onPress={handlePress}
                key={item.id?.toString()}
                style={{
                    flexDirection:'row',
                    alignItems:'center',
                    borderRadius: 10,
                    borderWidth:1,
                    borderColor: COLORS.secondaryWhite,
                    height: 110,
                    marginBottom: 16,
                    paddingHorizontal: 12,
                }}
            >   
                <Image
                    source={{uri: item.image}}
                    resizeMode='contain'
                    style={{
                        width:85,
                        height:85,
                        borderRadius:50,
                        marginRight:16,
                        backgroundColor: COLORS.black,
                    }}
                />
                <View
                    style={{
                        flexDirection:'column',
                        alignItems:'flex-start',
                    }}
                >
                    <Text
                        style={{
                            ...FONTS.body4,
                            fontWeight:'bold',
                            marginLeft:4,
                            marginBottom:6
                        }}
                    >
                        {item.fullName}
                    </Text>
                    <View
                        style={{
                            flexDirection:'row',
                            justifyContent:'center',
                            alignItems:'center'
                        }}
                    >
                        <MaterialCommunityIcons
                            name='blood-bag'
                            size={24}
                            color={COLORS.primary}
                        />
                        <Text
                            style={{
                                ...FONTS.body4,
                                marginLeft:8,
                            }}
                        >
                            {item.bloodTypeId}
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection:'row',
                            justifyContent:'center',
                            alignItems:'center',
                            marginTop: 6,
                        }}
                    >
                        <EvilIcons
                            name='location'
                            size={24}
                            color={COLORS.primary}
                        />
                        <Text
                            style={{
                                ...FONTS.body4,
                                marginLeft:8,
                            }}
                        >
                            {item.address}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default UserCard;