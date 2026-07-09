import { StyleSheet } from "react-native";

import {
    COLORS,
    SIZES,
} from "@/constants";

export default StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.secondaryWhite,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 3,
    },
});