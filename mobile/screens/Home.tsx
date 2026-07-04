import {
  Image,
  Text,
  TouchableOpacity,
  ListRenderItem,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Donation } from "@/models/App.types";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useDonationTypes } from "@/hooks/useDonationTypes";

const Home = () => {
  const router = useRouter();
  const {
    data: donations = [],
    isLoading,
    error,
  } = useDonationTypes();

  const renderItem: ListRenderItem<Donation> = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/information/details",
          params: item,
        });
      }}
      style={{
        height: 350,
        width: 350,
        borderColor: COLORS.black,
        borderWidth: 2,
        backgroundColor: COLORS.black,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 22,
        marginLeft: 22,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{
          height: 320,
          width: 320,
          borderRadius: 20,
        }}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          padding: 20,
          borderRadius: 20,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            letterSpacing: 1.5,
          }}
        >
          {item.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.black,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.black,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: COLORS.white, textAlign: "center" }}>
          Unable to load donation information. Please try again later.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.black,
      }}
    >
      <FlatList
        data={donations}
        keyExtractor={(item: Donation) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: COLORS.black,
        }}
      />
    </SafeAreaView>
  );
};

export default Home;
