import { StyleSheet } from "react-native";
import {
    COLORS,
} from "@/constants";

export default StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    text: {
        marginLeft: 10,
        color: COLORS.secondaryBlack,
        flex: 1,
    },
});