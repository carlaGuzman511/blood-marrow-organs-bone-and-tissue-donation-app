import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  urgencyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.danger, // or dynamic
  },
  time: {
    color: COLORS.secondaryGray,
    fontSize: 13,
    fontWeight: "500",
  },
});