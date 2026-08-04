import { StyleSheet } from "react-native";
import {
    COLORS,
} from "@/constants";

export default StyleSheet.create({  
  container: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", color: COLORS.black, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.secondaryWhite,
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  errorInput: { borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 13, marginTop: 4 },
});