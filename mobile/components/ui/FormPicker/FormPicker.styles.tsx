import { StyleSheet } from "react-native";
import {
    COLORS,
} from "@/constants";

export default StyleSheet.create({  
  container: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", color: COLORS.black, marginBottom: 6 },
  pickerButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.secondaryWhite,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorInput: { borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 13, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  cancelText: { color: COLORS.primary, fontSize: 16 },
  optionItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  optionText: { fontSize: 16, color: COLORS.black },
  selectedOption: { color: COLORS.primary, fontWeight: "600" },
});