import React, { useEffect } from "react";
import {
  View,
  FlatList,
  ListRenderItem,
} from "react-native";
import DonationCard from "@/components/DonationCard";
import { DonationPost } from "@/models/App.types";
import { useHomeContext } from "@/app/home/context";
import { useDonationPosts } from "@/hooks/useDonationPosts";

const DonationRequest = () => {
    const [state, actions] = useHomeContext();

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
              // keyExtractor={(item: DonationPost) => item.id?.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.2}
              onEndReached={() => {}}
            />
        </View>
    );
}

export default DonationRequest;