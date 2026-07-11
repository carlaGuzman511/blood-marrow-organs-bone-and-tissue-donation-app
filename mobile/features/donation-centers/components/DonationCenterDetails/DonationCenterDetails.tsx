import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDonationCenters } from '@/features/donation-centers/hooks/useDonationCenters';
import Header from '@/components/Header';
import { COLORS, FONTS } from '@/constants';
import { EvilIcons, MaterialCommunityIcons, Ionicons, Entypo } from '@expo/vector-icons';
import styles from './DonationCenterDetails.styles';

export default function DonationCenterDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: donationCenters = [], isLoading } = useDonationCenters();
  const center = donationCenters.find((item) => item.id === id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Header name="Center Details" onPress={() => router.back()} />
          <Text style={styles.loadingText}>Loading center details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!center) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Header name="Center Details" onPress={() => router.back()} />
          <Text style={styles.loadingText}>Donation center not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const services = center.donationTypes?.map((type) => type.name) ?? ['Blood Donation', 'Plasma Donation', 'Platelet Donation'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header name="Center Details" onPress={() => router.back()} />
        <Image source={{ uri: center.image }} resizeMode="cover" style={styles.centerImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.titleText}>{center.name}</Text>
          <View style={styles.locationRow}>
            <EvilIcons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>{center.address}</Text>
          </View>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="hospital-building" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>{center.city}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]}>
            <Ionicons name="call-outline" size={22} color={COLORS.green} />
            <Text style={[styles.actionText, styles.secondaryActionText]}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
            <Entypo name="forward" size={22} color={COLORS.white} />
            <Text style={[styles.actionText, styles.primaryActionText]}>Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          <View style={styles.card}>
            {services.map((service) => (
              <View key={service} style={styles.serviceItem}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Center Info</Text>
          <View style={styles.card}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{center.address}</Text>
            <Text style={styles.infoLabelWithSpacing}>Coordinates</Text>
            <Text style={styles.infoValue}>Lat {center.latitude.toFixed(4)}, Lon {center.longitude.toFixed(4)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
