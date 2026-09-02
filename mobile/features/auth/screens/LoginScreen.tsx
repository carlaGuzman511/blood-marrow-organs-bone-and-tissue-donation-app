import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginForm from "../components/LoginForm";
import styles from "./LoginScreen.styles";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LoginForm />
    </SafeAreaView>
  );
}
