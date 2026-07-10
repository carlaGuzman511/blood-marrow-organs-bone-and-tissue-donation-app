import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useSearchParams } from 'expo-router';
import { useDonationCenters } from '@/features/donation-centers/hooks/useDonationCenters';
import Header from '@/components/Header';
import { COLORS, FONTS, SIZES } from '@/constants';
import { EvilIcons, MaterialCommunityIcons, Ionicons, Entypo } from '@expo/vector-icons';

export default function DonationCenterDetails() {
  const router = useRouter();
  const params = useSearchParams();
  const id = Number(params.id);
  const { data: donationCenters = [], isLoading } = useDonationCenters();
  const center = donationCenters.find((item) => item.id === id);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={{ margin: 22 }}>
          <Header name="Center Details" onPress={() => router.back()} />
          <Text style={{ ...FONTS.body4, marginTop: 24 }}>Loading center details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!center) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={{ margin: 22 }}>
          <Header name="Center Details" onPress={() => router.back()} />
          <Text style={{ ...FONTS.body4, marginTop: 24 }}>Donation center not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const services = center.donationTypes?.map((type) => type.name) ?? ['Blood Donation', 'Plasma Donation', 'Platelet Donation'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ marginHorizontal: 22, marginTop: 22 }}>
          <Header name="Center Details" onPress={() => router.back()} />
          <Image
            source={{ uri: center.image }}
            resizeMode="cover"
            style={{
              width: '100%',
              height: 180,
              borderRadius: 20,
              marginTop: 22,
              backgroundColor: COLORS.secondaryWhite,
            }}
          />
          <View style={{ marginTop: 18 }}>
            <Text style={{ ...FONTS.h2 }}>{center.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <EvilIcons name="location" size={20} color={COLORS.primary} />
              <Text style={{ ...FONTS.body4, marginLeft: 8 }}>{center.address}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <MaterialCommunityIcons name="hospital-building" size={20} color={COLORS.primary} />
              <Text style={{ ...FONTS.body4, marginLeft: 8 }}>{center.city}</Text>
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
            <Text style={{ ...FONTS.h4, marginBottom: 16 }}>Available Services</Text>
            <View style={{ backgroundColor: COLORS.secondaryWhite, borderRadius: 18, padding: 18 }}>
              {services.map((service) => (
                <View
                  key={service}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    backgroundColor: COLORS.white,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ ...FONTS.body4 }}>{service}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 28 }}>
            <Text style={{ ...FONTS.h4, marginBottom: 16 }}>Center Info</Text>
            <View style={{ backgroundColor: COLORS.secondaryWhite, borderRadius: 18, padding: 18 }}>
              <Text style={{ ...FONTS.body4, color: COLORS.gray, marginBottom: 10 }}>Address</Text>
              <Text style={{ ...FONTS.body4 }}>{center.address}</Text>
              <Text style={{ ...FONTS.body4, color: COLORS.gray, marginTop: 16, marginBottom: 10 }}>Coordinates</Text>
              <Text style={{ ...FONTS.body4 }}>Lat {center.latitude.toFixed(4)}, Lon {center.longitude.toFixed(4)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
