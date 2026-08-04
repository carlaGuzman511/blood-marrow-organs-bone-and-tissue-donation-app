import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

export default StyleSheet.create({
  container: {
    marginTop: SIZES.base,
    paddingTop: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  chip: {
    backgroundColor: COLORS.secondaryWhite,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "500",
  },
});