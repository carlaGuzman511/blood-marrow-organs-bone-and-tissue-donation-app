import React from "react";
import {
  View,
  FlatList,
  ListRenderItem,
} from "react-native";
import DonationCard from "@/features/donation-posts/components/DonationCard/DonationCard";
import { DonationPost } from "@/models/App.types";
import { useDonationPosts } from "@/hooks/useDonationPosts";

const DonationRequest = () => {
    const {
      data: donationPosts = [],
      isLoading,
      error,
    } = useDonationPosts();
    
    const renderItem: ListRenderItem<DonationPost> = ({ item }) => (
        <DonationCard 
            item={item} 
            onPress={() => {}} 
        />
      );

    return (
        <View style={{ flex: 1, paddingHorizontal: 22 }}>
            <FlatList
              data={donationPosts}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.2}
              onEndReached={() => {}}
            />
        </View>
    );
}

export default DonationRequest;