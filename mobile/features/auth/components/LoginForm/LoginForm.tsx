import React from "react";
import { View, ActivityIndicator } from "react-native";
import AppText from "@/components/ui/AppText";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { COLORS } from "@/constants";
import { useAuth } from "../../context/AuthContext";
import styles from "./LoginForm.styles";

export default function LoginForm() {
  const { login, isAuthenticating, error } = useAuth();

  return (
    <View style={styles.container}>
      <AppText preset="h2" weight="700" style={styles.title}>
        Welcome back
      </AppText>
      <AppText preset="body3" color={COLORS.secondaryGray} style={styles.subtitle}>
        Sign in to continue donating and saving lives.
      </AppText>
      {isAuthenticating ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <PrimaryButton title="Log In" onPress={login} />
      )}
      {error && (
        <AppText preset="body4" color={COLORS.danger} style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}
