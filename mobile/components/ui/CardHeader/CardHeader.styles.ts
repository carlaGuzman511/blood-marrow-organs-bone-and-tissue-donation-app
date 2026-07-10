import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

export default StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.secondaryWhite,
    },
    content: {
        flex: 1,
        marginLeft: SIZES.padding,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: {
        flex: 1,
        marginRight: 12,
        color: COLORS.black,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    city: {
        marginLeft: 4,
        color: COLORS.secondaryBlack,
    },
});