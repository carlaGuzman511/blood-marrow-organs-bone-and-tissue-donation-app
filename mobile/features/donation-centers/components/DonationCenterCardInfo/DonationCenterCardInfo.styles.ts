import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

export default StyleSheet.create({
    container: {
        marginTop: SIZES.padding,
        gap: 10,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        color: COLORS.secondaryBlack,
        marginRight: 10,
    },
    value: {
        flex: 1,
        color: COLORS.secondaryBlack,
    },
});