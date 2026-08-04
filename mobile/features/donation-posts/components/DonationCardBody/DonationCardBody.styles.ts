import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({
  body: {
    marginTop: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.black,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.secondaryBlack,
    flexShrink: 1,
  },
});