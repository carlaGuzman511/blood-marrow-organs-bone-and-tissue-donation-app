import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDonors } from '@/hooks/useDonors';
import Header from '@/components/Header';
import { COLORS, FONTS } from '@/constants';
import { EvilIcons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import styles from './DonorDetails.styles';

export default function DonorDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id;
  const { data: users = [], isLoading } = useDonors();
  const user = users.find((item) => item.id === id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Header name="Donor Details" onPress={() => router.back()} />
          <Text style={styles.loadingText}>Loading donor details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Header name="Donor Details" onPress={() => router.back()} />
          <Text style={styles.loadingText}>Donor not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header name="Donor Details" onPress={() => router.back()} />
        <View style={styles.profileSection}>
          <Image source={{ uri: user.image }} resizeMode="cover" style={styles.avatar} />
          <Text style={styles.nameText}>{user.fullName}</Text>
          <View style={styles.locationRow}>
            <EvilIcons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>{user.city || 'Unknown location'}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
            <Entypo name="forward" size={22} color={COLORS.white} />
            <Text style={[styles.actionText, styles.primaryActionText]}>Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Donor</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.infoItem}>
                <Text style={styles.labelText}>Blood Type</Text>
                <Text style={styles.valueText}>{user.bloodType?.name ?? '—'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.labelText}>City</Text>
                <Text style={styles.valueText}>{user.city || 'Unknown'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donation Stats</Text>
          <View style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="hand-heart-outline" size={30} color={COLORS.primary} />
                <Text style={styles.statLabel}>Donated</Text>
                <Text style={styles.statValue}>6 Times</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="map-marker" size={30} color={COLORS.primary} />
                <Text style={styles.statLabel}>Location</Text>
                <Text style={styles.statValue}>{user.city || 'Unknown'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
