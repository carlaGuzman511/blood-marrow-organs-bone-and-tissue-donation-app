
import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
};