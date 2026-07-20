import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({
    container: {
        backgroundColor: "#FFE8E8",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 30,
    },
    text: {
        color: COLORS.red,
        fontWeight: "700",
    },
});