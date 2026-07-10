import { View, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState } from 'react';
import SearchDonationCenters from "@/screens/SearchDonationCenters";
import SearchUsers from "@/screens/SearchUsers";
import { COLORS, FONTS } from '@/constants';

export default function SearchScreen() {
  const [activeTab, setActiveTab] = useState<'donors' | 'centers'>('donors');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 22,
          paddingTop: 22,
          backgroundColor: COLORS.white,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('donors')}
            style={{
              flex: 1,
              marginRight: 8,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: activeTab === 'donors' ? COLORS.primary : COLORS.secondaryWhite,
              alignItems: 'center',
            }}
          >
            <Text style={{ ...FONTS.body4, color: activeTab === 'donors' ? COLORS.white : COLORS.black }}>
              Donors
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('centers')}
            style={{
              flex: 1,
              marginLeft: 8,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: activeTab === 'centers' ? COLORS.primary : COLORS.secondaryWhite,
              alignItems: 'center',
            }}
          >
            <Text style={{ ...FONTS.body4, color: activeTab === 'centers' ? COLORS.white : COLORS.black }}>
              Centers
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          {activeTab === 'donors' ? <SearchUsers /> : <SearchDonationCenters />}
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
