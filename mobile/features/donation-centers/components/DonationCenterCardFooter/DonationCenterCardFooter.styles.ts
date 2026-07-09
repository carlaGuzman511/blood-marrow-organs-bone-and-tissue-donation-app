import { StyleSheet } from "react-native";

import { COLORS, SIZES } from "@/constants";

export default StyleSheet.create({
    container: {
        marginTop: SIZES.padding,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    leftContainer: {
        flex: 1,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontWeight: "600",
    },
    hours: {
        marginTop: 4,
        color: COLORS.secondaryBlack,
    },
    rightContainer: {
        alignItems: "flex-end",
    },
    distanceContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    distance: {
        marginLeft: 4,
        color: COLORS.secondaryBlack,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
    },
    buttonText: {
        color: COLORS.primary,
        fontWeight: "600",
        marginRight: 2,
    },
});