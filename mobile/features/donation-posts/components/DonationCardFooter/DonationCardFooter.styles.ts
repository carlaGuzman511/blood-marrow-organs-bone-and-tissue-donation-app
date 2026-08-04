import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});