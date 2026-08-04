import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16, 
    marginVertical: 8,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border, 
  },
});