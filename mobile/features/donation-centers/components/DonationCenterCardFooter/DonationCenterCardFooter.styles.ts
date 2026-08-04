import { StyleSheet } from "react-native";

import { COLORS, SIZES } from "@/constants";

export default StyleSheet.create({
  container: {
    marginTop: SIZES.base,
    paddingTop: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  open: {
    backgroundColor: COLORS.success,
  },
  closed: {
    backgroundColor: COLORS.danger,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});