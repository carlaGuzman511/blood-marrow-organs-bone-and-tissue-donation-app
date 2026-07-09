import { StyleSheet } from "react-native";
import { SIZES } from "@/constants";

export default StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: SIZES.padding,
        gap: 8,
    },
});