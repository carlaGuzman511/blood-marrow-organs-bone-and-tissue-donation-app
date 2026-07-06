import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({

    card: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        marginVertical: 8,
        padding: 16,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },

        elevation: 4,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    body: {
        flexDirection: "row",
        marginTop: 16,
    },

    info: {
        flex: 1,
        marginLeft: 16,
    },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 18,
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

    time: {
        color: "#777",
        fontSize: 13,
    },

    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
    }

});