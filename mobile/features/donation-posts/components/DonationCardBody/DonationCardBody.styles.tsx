import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({
    body: {
        flexDirection: "row",
        marginTop: 16,
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.black,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.secondaryBlack,
        marginTop: 4,
    },
    location: {
        marginTop: 6,
        fontSize: 14,
        color: COLORS.secondaryBlack,
    },
    description: {
        marginTop: 10,
        lineHeight: 20,
        color: COLORS.secondaryBlack,
    },
});