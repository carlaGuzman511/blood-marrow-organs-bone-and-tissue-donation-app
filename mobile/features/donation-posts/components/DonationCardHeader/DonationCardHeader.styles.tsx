import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    time: {
        color: COLORS.secondaryGray,
        fontSize: 13,
    },
});