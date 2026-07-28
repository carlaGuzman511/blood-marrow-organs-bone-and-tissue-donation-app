import { Tabs } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MaterialCommunityIcons, AntDesign, Entypo } from "@expo/vector-icons";
import { COLORS } from "@/constants";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: COLORS.green,
        }}>
        <Tabs.Screen 
          name="home"  
          options={{
            title:"Home",
            href:"/home",
            tabBarLabel: "Home",
            tabBarIcon: ({color, focused}: any) => (
              <MaterialCommunityIcons
                name="home"
                size={24}
                color={color}
                focused={focused}
                />
            ),
          }}  
        />
        <Tabs.Screen 
          name="search"  
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="donors"
          options={{
            title: 'Donors',
            headerShown: false,
            tabBarLabel: 'Donors',
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialCommunityIcons name="account-heart-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="donation-centers"
          options={{
            title: 'Centers',
            headerShown: false,
            tabBarLabel: 'Centers',
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialCommunityIcons name="hospital-building" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen 
          name="profile" 
          options={{
            title:"Profile",
            tabBarLabel: "Profile",
            tabBarIcon: ({color, focused}: any) => (
              <AntDesign 
                name="user" 
                size={24}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen 
          name="information" 
          options={{
            title:"Information",
            headerShown: false,
            tabBarLabel: "Information",
            tabBarIcon: ({color, focused}: any) => (
              <MaterialCommunityIcons 
                name="book-education-outline" 
                size={24}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen 
          name="reports"  
          options={{
            title:"Reports",
            headerShown: false,
            tabBarLabel: "Reports",
            tabBarIcon: ({color, focused}: any) => (
              <Entypo 
                name="line-graph" 
                size={24}
                color={color}
                focused={focused}
              />                 
            ),
          }}
        />
        </Tabs>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
