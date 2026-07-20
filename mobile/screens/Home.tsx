import {
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants";
import { Donation } from "@/models/App.types";
import InformationCard from "@/features/information/components/InformationCard/InformationCard";
import { useDonationTypes } from "@/features/information/hooks/useDonationTypes";
import styles from "./Home.styles";

const Home = () => {
  const {
    data,
    isLoading,
    error,
  } = useDonationTypes();

  const donations = data ?? [];

  const renderItem = ({ item }: { item: Donation }) => (
    <InformationCard item={item} />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Unable to load donation information. Please try again later.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={donations}
        keyExtractor={(item: Donation) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

export default Home;
