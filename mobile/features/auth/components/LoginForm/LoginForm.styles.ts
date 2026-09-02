import { StyleSheet } from "react-native";
import { SIZES } from "@/constants";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SIZES.padding,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  loader: {
    marginTop: 8,
  },
  error: {
    marginTop: 16,
    textAlign: "center",
  },
});
