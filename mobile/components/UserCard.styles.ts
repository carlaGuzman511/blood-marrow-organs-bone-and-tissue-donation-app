import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from "@/constants";

const styles = StyleSheet.create({
  touchable: {
    marginBottom: SIZES.margin,
  },
  card: {
    paddingBottom: SIZES.padding,
  },
  infoSection: {
    marginTop: SIZES.base,
    paddingTop: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondaryWhite,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  infoText: {
    marginLeft: 8,
    color: COLORS.black,
    fontWeight: "500",
  },
});

export default styles;