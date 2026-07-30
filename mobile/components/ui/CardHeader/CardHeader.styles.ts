import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

export default StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.base,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondaryWhite,
    borderWidth: 2,
    borderColor: COLORS.primary, 
    // subtle shadow on avatar
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    flex: 1,
    marginRight: 12,
    color: COLORS.black,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  city: {
    marginLeft: 6,
    color: COLORS.secondaryBlack,
  },
});