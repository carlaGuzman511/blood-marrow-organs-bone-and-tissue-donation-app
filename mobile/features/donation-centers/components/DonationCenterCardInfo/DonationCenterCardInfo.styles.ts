import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

export default StyleSheet.create({
  container: {
    marginTop: SIZES.base,
    paddingTop: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    color: COLORS.secondaryBlack,
    marginRight: 8,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 14,
    flexShrink: 1,
  },
  bold: {
    fontWeight: "500",
    color: COLORS.text,
  },
  value: {
    flex: 1,
    color: COLORS.secondaryBlack,
  },
});