import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useSearchParams } from 'expo-router';
import { useUsers } from '@/hooks/useUsers';
import Header from '@/components/Header';
import { COLORS, FONTS, SIZES } from '@/constants';
import { EvilIcons, MaterialCommunityIcons, Ionicons, Entypo } from '@expo/vector-icons';

export default function DonorDetails() {
  const router = useRouter();
  const params = useSearchParams();
  const id = Number(params.id);
  const { data: users = [], isLoading } = useUsers();
  const user = users.find((item) => item.id === id);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={{ margin: 22 }}>
          <Header name="Donor Details" onPress={() => router.back()} />
          <Text style={{ ...FONTS.body4, marginTop: 24 }}>Loading donor details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={{ margin: 22 }}>
          <Header name="Donor Details" onPress={() => router.back()} />
          <Text style={{ ...FONTS.body4, marginTop: 24 }}>Donor not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ marginHorizontal: 22, marginTop: 22 }}>
          <Header name="Donor Details" onPress={() => router.back()} />
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Image
              source={{ uri: user.image }}
              resizeMode="cover"
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: COLORS.secondaryWhite,
              }}
            />
            <Text style={{ ...FONTS.h2, marginTop: 18 }}>{user.fullName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <EvilIcons name="location" size={20} color={COLORS.primary} />
              <Text style={{ ...FONTS.body4, marginLeft: 8 }}>{user.address}</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 24,
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: COLORS.secondaryWhite,
                borderRadius: SIZES.radius,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Ionicons name="call-outline" size={22} color={COLORS.green} />
              <Text style={{ ...FONTS.body4, color: COLORS.green, marginTop: 8 }}>Call Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: COLORS.primary,
                borderRadius: SIZES.radius,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Entypo name="forward" size={22} color={COLORS.white} />
              <Text style={{ ...FONTS.body4, color: COLORS.white, marginTop: 8 }}>Request</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 28 }}>
            <Text style={{ ...FONTS.h4, marginBottom: 16 }}>About Donor</Text>
            <View style={{ backgroundColor: COLORS.secondaryWhite, borderRadius: 18, padding: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View>
                  <Text style={{ ...FONTS.body4, color: COLORS.gray }}>Blood Type</Text>
                  <Text style={{ ...FONTS.h3, marginTop: 8 }}>{user.bloodTypeId}</Text>
                </View>
                <View>
                  <Text style={{ ...FONTS.body4, color: COLORS.gray }}>Phone</Text>
                  <Text style={{ ...FONTS.h3, marginTop: 8 }}>{user.phoneNumber}</Text>
                </View>
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ ...FONTS.body4, color: COLORS.gray }}>Date of Birth</Text>
                <Text style={{ ...FONTS.body4, marginTop: 8 }}>{user.dateOfBirth}</Text>
              </View>
              <View>
                <Text style={{ ...FONTS.body4, color: COLORS.gray }}>Address</Text>
                <Text style={{ ...FONTS.body4, marginTop: 8 }}>{user.address}</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 28 }}>
            <Text style={{ ...FONTS.h4, marginBottom: 16 }}>Donation Stats</Text>
            <View style={{ backgroundColor: COLORS.secondaryWhite, borderRadius: 18, padding: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <MaterialCommunityIcons name="hand-heart-outline" size={30} color={COLORS.primary} />
                  <Text style={{ ...FONTS.body4, marginTop: 10 }}>Donated</Text>
                  <Text style={{ ...FONTS.h3, marginTop: 6 }}>6 Times</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <MaterialCommunityIcons name="map-marker" size={30} color={COLORS.primary} />
                  <Text style={{ ...FONTS.body4, marginTop: 10 }}>Location</Text>
                  <Text style={{ ...FONTS.h3, marginTop: 6 }}>{user.address.split(',')[0] || 'Unknown'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
