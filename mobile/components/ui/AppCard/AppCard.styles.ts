import { StyleSheet } from "react-native";

import {
    COLORS,
    SIZES,
} from "@/constants";

export default StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    // Shadow iOS
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    // Elevation Android
    elevation: 4,
  },
});