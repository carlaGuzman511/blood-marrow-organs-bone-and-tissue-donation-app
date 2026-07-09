import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({

    container: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.secondaryWhite,
        borderWidth: 1,
        borderColor: COLORS.secondaryWhite,
    },
    selected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    label: {
        color: COLORS.secondaryBlack,
    },
    selectedLabel: {
        color: COLORS.white,
    },
});