import { StyleSheet } from "react-native";

import { COLORS } from "@/constants";

export default StyleSheet.create({
    placeholder: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.secondaryWhite,
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    image:{
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
});