import { Tabs } from "expo-router";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MaterialCommunityIcons, AntDesign, Entypo } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { AuthProvider, LoginScreen, useAuth } from "@/features/auth";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <AppContent />
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
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
          name="donors/index"
          options={{
            title: 'Donors',
            href:"/donors",
            tabBarLabel: 'Donors',
            tabBarIcon: ({ color, focused }: { color: string, focused: any }) => (
              <MaterialCommunityIcons 
                name="account-heart-outline" 
                size={24} 
                color={color} 
                  
                />
            ),
          }}
        />
        <Tabs.Screen
          name="donation-centers/index"
          options={{
            title: 'Donation Centers',
            href:"/donation-centers",
            tabBarLabel: 'Donation Centers',
            tabBarIcon: ({ color, focused }: { color: string, focused: any }) => (
              <MaterialCommunityIcons 
                name="hospital-building" 
                size={24} 
                color={color}
                focused={focused}  
              />
            ),
          }}
        />
        <Tabs.Screen
          name="donation-posts/index"
          options={{
            title: 'Donation Posts',
            href:"/donation-posts",
            tabBarLabel: 'Donation Posts',
            tabBarIcon: ({ color, focused }: { color: string, focused: any }) => (
              <MaterialCommunityIcons 
                name="hospital-building" 
                size={24} 
                color={color}
                focused={focused}  
              />
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
  );
}
