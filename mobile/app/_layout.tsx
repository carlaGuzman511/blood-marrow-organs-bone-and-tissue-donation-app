import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MaterialCommunityIcons, AntDesign, Entypo } from "@expo/vector-icons";
import { AuthProvider, LoginScreen, useAuth } from "@/features/auth";
import { ThemeProvider, useTheme } from "@/theme";

const queryClient = new QueryClient();

// Keep the splash up until Plus Jakarta Sans is ready, so text doesn't jump fonts.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // Only the weights the type scale uses (each import bundles one file).
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const fontsSettled = fontsLoaded || !!fontError;

  useEffect(() => {
    if (fontError) console.warn("Plus Jakarta Sans failed to load; using the system font.", fontError);
    if (fontsSettled) SplashScreen.hideAsync().catch(() => {});
  }, [fontsSettled, fontError]);

  if (!fontsSettled) return null;

  return (
    // Light only until dark mode reaches navigation and every screen (US-MOB-08 step 4).
    <ThemeProvider fontsLoaded={fontsLoaded} scheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <AppContent />
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();
  const { colors, typography } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primaryText,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarLabelStyle: typography.labelSm,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: typography.titleSm,
            sceneStyle: { backgroundColor: colors.background },
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
